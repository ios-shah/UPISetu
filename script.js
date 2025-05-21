const appSettings = JSON.parse(localStorage.getItem("appSettings") || "{}");

// Function to generate a random transaction ID
const deploymentID = appSettings.deploymentId;
const upiID = appSettings.upiId;
const upiID1 = appSettings.upiId;

const senderName = appSettings.senderName;
const senderName1 = appSettings.senderName;

let transactionID = "";

function showGlobalLoading(message = "⏳ Loading") {
  const overlay = document.getElementById("globalLoading");
  const msgSpan = document.getElementById("loadingMessage");
  msgSpan.textContent = message;
  overlay.style.display = "flex";
}

function hideGlobalLoading() {
  document.getElementById("globalLoading").style.display = "none";
}

// Initialize intl-tel-input
// Global variable for iti
let iti;

document.addEventListener("DOMContentLoaded", function () {
    const input = document.querySelector("#wano");
    iti = window.intlTelInput(input, {
        initialCountry: "in", // default India
        preferredCountries: ["in", "us", "gb"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const userEl = document.getElementById("username");
    if (userEl) {
        userEl.textContent = senderName;
    }
});
function generateRandomID(length = 12) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to generate a UPI QR Code and store in Google Sheets
function generateQR() {
    let amount = document.getElementById("amount").value;
    let name = document.getElementById("name").value;
    let note = document.getElementById("note").value;
    transactionID = generateRandomID(12); // Generate unique transaction ID

    if (!amount) {
        alert("Please enter an amount");
        return;
    }

    const phoneNumber = iti.getNumber().replace(/\s/g, '');  // 🧠 Fetch FULL number with country code
    const wano = phoneNumber.replace(/\+/g, ''); // Remove + sign for WhatsApp

    // Store in Google Sheets
    sendToGoogleSheets(upiID, appSettings.senderName, name, wano, amount, note, transactionID);



}

function isMobileDevice() {
    // Check if the device is mobile using the userAgent
    return /Mobi|Android/i.test(navigator.userAgent);
}


function sendMessage() {
    showGlobalLoading("⏳Sending message...");
    fetch(`https://script.google.com/macros/s/${deploymentID}/exec?q=${transactionID}`)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Inspect the response

            if (data.status === "success") {
                console.log("UPI ID:", data.upiID);
                console.log("Name:", data.name);
                console.log("WhatsApp Number:", data.wano);
                console.log("Amount:", data.amount);
                console.log("Note:", data.note);
                console.log("Transaction ID:", transactionID);
                console.log("QR Code URL:", data.qrCodeUrl);

                // Now send WhatsApp message
                const phone = data.wano;

                const message = `🌟 *Payment Request* 🌟

👤 *Customer:* ${data.name}

🧾 *Payment Details:*
• *Amount:* ₹${data.amount}
• *Note:* ${data.note}
• *Transaction ID:* ${transactionID}
• *Payment Link:* https://upi-setu.vercel.app/pay.html?id=${transactionID}
💳 *Payment Instructions:*
Scan the attached QR code 📷 *or* use the UPI ID 👉 *${data.upiID}* to complete your payment.

🕒 *Kindly complete the payment at your earliest convenience.*

🙏 Thank you for choosing us!`;




                const amount = data.amount;
                const qrcode = data.qrCodeUrl;
                const isMobile = isMobileDevice();

                const serverURL = isMobile ? "https://whatsapp-web-bot-production.up.railway.app/send-whatsapp" : "https://whatsapp-web-bot-production.up.railway.app/send-whatsapp";

                fetch(serverURL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: phone, message: message, amount: amount, qrcode: qrcode })
                })
                    .then(response => response.json())
                    .then(serverData => {
                        showGlobalLoading("✅ Message Sent");
                        setTimeout(() => {
                            hideGlobalLoading();
                        }, 2000); // hide after 2 seconds
                    })
                    .catch(error => console.error("Error sending WhatsApp message:", error));
            } else {
                alert("Failed to fetch data from Google Apps Script.");
            }
        })
        .catch(error => console.error("Error fetching UPI data:", error));
}

function sendReminder(txnid) {
    showGlobalLoading("⏳Sending reminder...");

    fetch(`https://script.google.com/macros/s/${deploymentID}/exec?q=${txnid}`)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Inspect the response

            if (data.status === "success") {
                const phone = data.wano;

                const message = `🔔 *Payment Reminder* 🔔

Hi ${data.name},

This is a kind reminder regarding your pending payment.

🧾 *Payment Details:*
• *Amount:* ₹${data.amount}
• *Note:* ${data.note}
• *Transaction ID:* ${txnid}
• *Payment Link:* https://upi-setu.vercel.app/pay.html?id=${txnid}

💳 *To Pay:*
Scan the QR code or use the UPI ID 👉 *${data.upiID}*

We kindly request you to complete the payment at your earliest convenience.

🙏 Thank you!`;

                const amount = data.amount;
                const qrcode = data.qrCodeUrl;
                const isMobile = isMobileDevice();

                const serverURL = isMobile
                    ? "https://whatsapp-web-bot-production.up.railway.app/send-whatsapp"
                    : "https://whatsapp-web-bot-production.up.railway.app/send-whatsapp";

                fetch(serverURL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: phone, message: message, amount: amount, qrcode: qrcode })
                })
                    .then(response => response.json())
                    .then(serverData => {
                        showGlobalLoading("✅ Reminder Sent");
                        setTimeout(() => {
                            hideGlobalLoading();
                        }, 2000); // hide after 2 seconds
                    })
                    .catch(error => {
                        hideGlobalLoading();
                        console.error("Error sending WhatsApp message:", error);
                        alert("❌ Failed to send WhatsApp message.");
                    });
            } else {
                hideGlobalLoading();
                alert("❌ Failed to fetch data from Google Apps Script.");
            }
        })
        .catch(error => {
            hideGlobalLoading();
            console.error("Error fetching UPI data:", error);
            alert("❌ An error occurred while fetching UPI data.");
        });
}



function copyLink() {
    let paymentLink = document.getElementById("paymentLink").value;
    if (!paymentLink) {
        alert("No link to copy. Generate one first!");
        return;
    }

    let tempInput = document.createElement("textarea"); // Use <textarea> for better support
    tempInput.value = paymentLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    alert("Payment link copied!");
}

function markAsPaid(transactionId) {
    fetch(`https://script.google.com/macros/s/${deploymentID}/exec`, {
        method: 'POST',
        body: new URLSearchParams({
            action: 'markAsPaid',
            transactionID: transactionId
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Marked as Paid!');
                fetchAndRenderTransactions();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Request failed', err);
        });
}


function sendToGoogleSheets(upiID, sendername, name, wano, amount, note, transactionID) {
  const url = `https://script.google.com/macros/s/${deploymentID}/exec`;
  const userEmail = localStorage.getItem("upi_user_email");

  if (!userEmail) {
    alert("User email not found. Please log in again.");
    return;
  }

  console.log("Email:", userEmail);

  let formData = new FormData();
  formData.append("action", "create");
  formData.append("upiID", String(upiID));
  formData.append("sendername", String(sendername));
  formData.append("name", String(name));
  formData.append("email", String(userEmail));
  formData.append("wano", String(wano));
  formData.append("amount", String(amount));
  formData.append("note", String(note));
  formData.append("transactionID", String(transactionID));

  showGlobalLoading();

  
fetch(url, {
  method: "POST",
  body: formData
})
.then(response => response.json())  // 🔧 Parse JSON properly
.then(data => {
  console.log("Data sent successfully:", data);
  console.log("QR Code URL:", data.qrCodeUrl); // ✅ Now this will work

  showGlobalLoading("✅ Payment link generated!");

  let paymentLink = `/pay.html?id=${transactionID}`;
  const linkEl = document.getElementById("paymentLink");
  linkEl.href = paymentLink;
  linkEl.textContent = paymentLink;

  document.getElementById("copyBtn").style.display = "block";
  document.getElementById("copygrp").style.display = "block";
  document.getElementById("wabutton").style.display = "block";
  document.getElementById("qrtxnid").textContent = `Txn ID: ${transactionID}`;

  // ✅ Show QR Code
  const qrContainer = document.getElementById("qrCodeContainer");
  const qrImage = document.getElementById("qrCodeImage");
  if (qrImage && data.qrCodeUrl) {
    qrImage.src = data.qrCodeUrl;
    qrContainer.style.display = "block";
  }

  setTimeout(() => {
    hideGlobalLoading();
  }, 2000);
})
  .catch(error => {
    console.error("Error:", error);
    showGlobalLoading("❌ Error sending data. Try again.");

    // Hide overlay after 3 seconds on error
    setTimeout(() => {
      hideGlobalLoading();
    }, 3000);
  });
}



// Run only on pay.html
// Run only on pay.html
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("pay.html")) {
        showLoader();
        setTimeout(fetchPaymentDetails, 4000); // Fetch data after 4 seconds
    }
});

// Function to show loader for 4 seconds
function showLoader() {
    document.getElementById("loader").style.display = "flex";  // Show loader
    document.getElementById("paymentContainer").style.display = "none"; // Hide content
}

// Function to fetch payment details from Google Sheets and display QR & UPI links



function loadDashboard() {
    showGlobalLoading(); // Show the loader before the fetch starts

    fetch(`https://script.google.com/macros/s/${deploymentID}/exec?action=getDashboardData&email=${userEmail1}`)
        .then(response => response.json())
        .then(data => {
            console.log("Received data:", data);
            renderDashboard(data);
        })
        .catch(error => {
            console.error("Error fetching dashboard data:", error);
        })
        .finally(() => {
            hideGlobalLoading(); // Always hide the loader when done
        });
}


function renderDashboard(data) {
    console.log("Received data:", data);
  
    if (!data || !Array.isArray(data.recentTransactions)) {
      document.getElementById('recentTransactions').innerHTML =
        `<tr><td colspan="7" class="text-center text-muted">No recent transactions available.</td></tr>`;
      return;
    }
  
    // Today’s metrics
    document.getElementById('todayAmount').textContent  = `₹${data.todayTotalAmount ?? 0}`;
    document.getElementById('todayCount').textContent   = data.todayCount ?? 0;
    document.getElementById('todayPending').textContent = `₹${data.todayPendingAmount ?? 0}`;
  
    // All-time metrics
    document.getElementById('allAmount').textContent    = `₹${data.allTotalAmount ?? 0}`;
    document.getElementById('allCount').textContent     = data.allTotalCount ?? 0;
    document.getElementById('allPending').textContent   = `₹${data.allPendingAmount ?? 0}`;
  
    // Recent transactions
    const tbody = document.getElementById('recentTransactions');
    tbody.innerHTML = '';
    data.recentTransactions.forEach(txn => {
      tbody.innerHTML += `
         <tr>
    <td data-label="Time">${new Date(txn.timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}</td>
    <td data-label="Name">${txn.name}</td>
    <td data-label="Amount">₹${txn.amount}</td>
    <td data-label="Status">${txn.status}</td>
    <td data-label="Txn ID">${txn.txnId}</td>
  </tr>`;
    });
  
    // Draw the chart
    drawChart(data.dailyEarnings || {});
  }
  

function drawChart(dailyEarnings) {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
        const rows = Object.entries(dailyEarnings).map(([day, amt]) => [day, parseFloat(amt) || 0]);

        if (!rows.length) {
            document.getElementById('chart_div').innerHTML =
                '<p class="text-center text-muted">No earnings data available.</p>';
            return;
        }

        const dataArray = [
            ['Day', 'Earnings'],
            ...rows
        ];

        const data = google.visualization.arrayToDataTable(dataArray);

        const options = {
            title: 'Earnings This Week',
            curveType: 'function',
            legend: { position: 'bottom' },
            height: 400,
            colors: ['#0d6efd']
        };

        const chart = new google.visualization.LineChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("allAmount")) {
        loadDashboard();
    }

    if (document.getElementById("txnTableBody")) {
        fetchAndRenderTransactions();
    }

    if (document.getElementById("settingsForm")) {
        // settings page logic already exists
    }

    if (window.location.pathname.includes("pay.html")) {
        showLoader();
        setTimeout(fetchPaymentDetails, 4000);
    }
});
const userEmail1 = localStorage.getItem("upi_user_email");

const scriptURL = `https://script.google.com/macros/s/${deploymentID}/exec?action=getAllTransactions&email=${userEmail1}`;

function fetchAndRenderTransactions() {
    fetch(scriptURL)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("txnTableBody");
            if (!tbody) return;

            tbody.innerHTML = "";

            if (!data.transactions || !data.transactions.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No transactions found.</td></tr>`;
                return;
            }

            data.transactions.forEach(txn => {
                console.log(txn);
                const status = txn.Status || 'Pending';
                const statusClass = status.toLowerCase() === 'paid' ? 'text-success' : 'text-danger';

                tbody.innerHTML += `
  <tr>
  <td data-label="Date">
    ${new Date(txn.Timestamp || txn.Time).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(',', '')}
  </td>

  <td data-label="Name">${txn.Name || '-'}</td>
  <td data-label="Amount">₹${txn.Amount || '0'}</td>
  <td data-label="WhatsApp No">+${txn.Whatsappno || '-'}</td>
  <td data-label="Status" class="${statusClass} fw-bold">${status}</td>
  <td data-label="Txn ID">${txn.TransactionId || txn['Txn ID'] || '-'}</td>
  <td data-label="">
    ${status.toLowerCase() !== 'paid' 
      ? `<button class="btn btn-success btn-sm" onclick="markAsPaid('${txn.TransactionId || txn['Txn ID']}')">Mark as Paid</button>`
      : ''
    }
  </td>
  <td data-label="">
    ${status.toLowerCase() !== 'paid' 
      ? `<button class="btn btn-success btn-sm" onclick="sendReminder('${txn.TransactionId || txn['Txn ID']}')">Send Reminder</button>`
      : ''
    }
  </td>
</tr>

`;

            });
        })
        .catch(err => {
            console.error("Fetch error:", err);
            const tbody = document.getElementById("txnTableBody");
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load transactions.</td></tr>`;
            }
        });
}

// Trigger it when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    fetchAndRenderTransactions();
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settingsForm");

    // Load saved settings
    const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");
    if (settings.upiId) document.getElementById("upiId").value = settings.upiId;
    if (settings.senderName) document.getElementById("senderName").value = settings.senderName;
    if (settings.deploymentId) document.getElementById("deploymentId").value = settings.deploymentId;
    if (settings.adminEmail) document.getElementById("adminEmail").value = settings.adminEmail;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const newSettings = {
            upiId: document.getElementById("upiId").value,
            senderName: document.getElementById("senderName").value,
            deploymentId: document.getElementById("deploymentId").value,
            adminEmail: document.getElementById("adminEmail").value,
        };
        localStorage.setItem("appSettings", JSON.stringify(newSettings));
    });
});


document.addEventListener("DOMContentLoaded", function () {
    // Fetch the settings from localStorage
    const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");

    // Get references to the display elements
    const upiIdDisplay = document.getElementById("upiIdDisplay");
    const senderNameDisplay = document.getElementById("senderNameDisplay");

    // Set the UPI ID and Sender Name dynamically
    if (settings.upiId) {
        upiIdDisplay.textContent = upiID1;  // Display UPI ID
    } else {
        upiIdDisplay.textContent = "Not set";  // Default text if not set
    }

    if (settings.senderName) {
        senderNameDisplay.textContent = senderName1;  // Display Sender Name
    } else {
        senderNameDisplay.textContent = "Not set";  // Default text if not set
    }
});
    function loadSidebar() {
      fetch('sidebar.html')
        .then(response => response.text())
        .then(data => {
          document.getElementById('sidebar-container').innerHTML = data;
        })
        .catch(error => {
          console.error('Error loading sidebar:', error);
        });
    }

    // Load the sidebar on page load
    window.onload = loadSidebar;
