// Assuming this is part of your connectWallet.js
document.addEventListener('DOMContentLoaded', function() {
    const walletConnectButton = document.getElementById('wallet-connect');
    if (walletConnectButton) {
        walletConnectButton.addEventListener('click', function() {
            const auth0_id = localStorage.getItem('userId');
            if (!auth0_id) {
                alert('Please log in before connecting a wallet.');
                return;
            }

            const phantom = window.solana;
            if (phantom && phantom.isPhantom) {
                phantom.connect().then((response) => {
                    const walletAddress = response.publicKey.toString();
                    // Immediately send the wallet address to the server after successful connection
                    fetch('/store-wallet', {
                        method: 'POST',      
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ walletAddress: walletAddress, auth0_id: localStorage.getItem('userId') })
                        })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message); // You might want to handle this more gracefully in a production environment
                    })
                    .catch(err => {
                        console.error('Error storing wallet address:', err);
                        alert('Error connecting wallet. Please try again.');
                    });
                }).catch(err => {
                    console.error('Error during wallet connection:', err);
                    alert('Failed to connect to Phantom wallet. Please make sure it is installed.');
                });
            } else {
                alert('Phantom wallet not found. Please install it.');
            }
        });
    }
});
