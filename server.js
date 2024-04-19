const express = require('express');
const path = require('path');
const { auth } = require('express-openid-connect');
const { MongoClient } = require('mongodb');
const { TwitterApi } = require('twitter-api-v2');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clustersocialfi.thdd2ky.mongodb.net/`;
const client = new MongoClient(mongoUri);

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

app.use(auth(config));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET_KEY,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const taskPoints = {
    follow: 500,
    like: 200,
    comment: 200,
    retweet: 200,
    tag: 250,
    useHashtag: 150
};

function calculateLevel(points) {
    return Math.min(Math.floor(points / 100) + 1, 150);
}

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profile', async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        const userData = await client.db("SocialFiDB").collection("userProfiles").findOne({ auth0_id: req.oidc.user.sub });
        if (userData) {
            res.json({
                isAuthenticated: true,
                user: req.oidc.user,
                points: userData.points,
                rank: calculateLevel(userData.points),
                referralLink: userData.referralLink,
            });
        } else {
            const defaultProfile = {
                auth0_id: req.oidc.user.sub,
                points: 0,
                rank: calculateLevel(0),
                referralLink: `https://yourapp.com/referral/${req.oidc.user.sub}`,
                wallet: ""
            };
            await client.db("SocialFiDB").collection("userProfiles").insertOne(defaultProfile);
            res.json({
                isAuthenticated: true,
                user: req.oidc.user,
                points: defaultProfile.points,
                rank: defaultProfile.rank,
                referralLink: defaultProfile.referralLink,
            });
        }
    } else {
        res.status(401).json({ isAuthenticated: false });
    }
});

app.post('/update-tickets', async (req, res) => {
    const { auth0_id, taskId, taskType } = req.body;

    if (!auth0_id) {
        return res.status(400).json({ success: false, message: 'No user ID provided' });
    }

    const verificationResult = await verifyTaskCompletion(auth0_id, taskType);
    if (verificationResult.success) {
        const profile = await client.db("SocialFiDB").collection("userProfiles").findOne({ auth0_id });
        if (!profile.tasksCompleted.find(t => t.taskId === taskId)) {
            const newPoints = profile.points + verificationResult.points;
            const updateResult = await client.db("SocialFiDB").collection("userProfiles").updateOne(
                { auth0_id },
                {
                    $inc: { points: verificationResult.points },
                    $push: { tasksCompleted: { taskId: taskId, completedOn: new Date() } }
                }
            );
            if (updateResult.modifiedCount > 0) {
                res.json({ success: true, message: 'Tickets updated successfully.', newPoints, newRank: calculateLevel(newPoints) });
            } else {
                res.status(500).json({ success: false, message: 'Failed to update user profile.' });
            }
        } else {
            res.json({ success: false, message: 'Task already completed.' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Failed to verify task. Please try again.' });
    }
});

app.post('/store-wallet', async (req, res) => {
    console.log(req.body);  // Log to see what is being received
    console.log(JSON.stringify({ walletAddress: walletAddress, auth0_id: auth0_id }));
    const { walletAddress, auth0_id } = req.body;

    if (!auth0_id) {
        return res.status(401).json({ message: 'User must be logged in.' });
    }

    if (!walletAddress || !auth0_id) {
        return res.status(400).json({ message: 'Wallet address and user ID are required.' });
    }

    try {
        const updateResult = await client.db("SocialFiDB").collection("userProfiles")
            .updateOne(
                { auth0_id: auth0_id },
                { $set: { wallet: walletAddress } },
                { upsert: true } // Changed from false to true
            );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(200).json({ message: 'No changes made. Wallet address might be the same or user not found.' });
        }

        res.status(200).json({ message: 'Wallet address updated successfully.' });
    } catch (error) {
        console.error('Failed to store wallet address:', error);
        res.status(500).json({ message: 'An error occurred while storing the wallet address.' });
    }
});


async function verifyTaskCompletion(auth0_id, taskType) {
    const userProfile = await client.db("SocialFiDB").collection("userProfiles").findOne({ auth0_id });
    if (!userProfile || !userProfile.twitterAccessToken || !userProfile.twitterAccessSecret) {
        console.error('No access tokens available.');
        return { success: false };
    }

    const userTwitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET_KEY,
        accessToken: userProfile.twitterAccessToken,
        accessSecret: userProfile.twitterAccessSecret,
    });

    return { success: true, points: taskPoints[taskType] }; // Assume success for demonstration
}

startServer();
