// Firebase Config - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAI7cI6oCg9kalWE0u3kLNGjC5iH7xHDOQ",
  authDomain: "raverajacoworkingspace-7f7ee.firebaseapp.com",
  projectId: "raverajacoworkingspace-7f7ee",
  storageBucket: "raverajacoworkingspace-7f7ee.firebasestorage.app",
  messagingSenderId: "534821803795",
  appId: "1:534821803795:web:aab3c4c3fd790865562ce6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let selectedGuestId = "";

function openNewGuest() {
  document.getElementById("newGuestModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function openStayingGuest() {
  document.getElementById("guestListModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  loadGuestList();
}

function closeModals() {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.style.display = "none";
  });
  document.getElementById("overlay").style.display = "none";
}

// Save new guest
function saveNewGuest() {
  const name = document.getElementById("guestName").value;
  const number = document.getElementById("guestNumber").value;
  const total = parseFloat(document.getElementById("totalAmount").value);
  const advance = parseFloat(document.getElementById("advanceAmount").value);

  db.collection("guests").add({
    name, number, total, advance,
    balance: total - advance,
    bills: []
  }).then(() => {
    alert("Guest saved!");
    closeModals();
    // Clear inputs
    document.getElementById("guestName").value = "";
    document.getElementById("guestNumber").value = "";
    document.getElementById("totalAmount").value = "";
    document.getElementById("advanceAmount").value = "";
  }).catch(err => alert("Error: " + err));
}

// Load guests
function loadGuestList() {
  const guestList = document.getElementById("guestList");
  guestList.innerHTML = "";

  db.collection("guests").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const btn = document.createElement("button");
      btn.innerText = data.name;
      btn.onclick = () => selectGuest(doc.id, data.name);
      guestList.appendChild(btn);
    });
  });
}

function selectGuest(id, name) {
  selectedGuestId = id;
  document.getElementById("selectedGuestName").innerText = name;
  closeModals();
  document.getElementById("guestOptionsModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function openAddBill() {
  document.getElementById("addBillModal").style.display = "block";
}

function saveBill() {
  const item = document.getElementById("billItem").value;
  const amount = parseFloat(document.getElementById("extraBill").value);

  const guestRef = db.collection("guests").doc(selectedGuestId);
  guestRef.get().then(doc => {
    const data = doc.data();
    const updatedBills = data.bills || [];
    updatedBills.push({ item, amount });

    const newTotal = data.total + amount;
    const newBalance = newTotal - data.advance;

    return guestRef.update({
      total: newTotal,
      balance: newBalance,
      bills: updatedBills
    });
  }).then(() => {
    alert("Bill added!");
    closeModals();
    // Clear inputs
    document.getElementById("billItem").value = "";
    document.getElementById("extraBill").value = "";
  }).catch(err => alert("Error: " + err));
}

function viewBill() {
  const guestRef = db.collection("guests").doc(selectedGuestId);
  guestRef.get().then(doc => {
    const data = doc.data();
    let summary = `Name: ${data.name}\nNumber: ${data.number}\nTotal: ₹${data.total}\nAdvance: ₹${data.advance}\nBalance: ₹${data.balance}\n\nBills:\n`;
    (data.bills || []).forEach((b, i) => {
      summary += `${i + 1}. ${b.item}: ₹${b.amount}\n`;
    });
    document.getElementById("billSummary").innerText = summary;
    document.getElementById("viewBillModal").style.display = "block";
  });
}

function closeBill() {
  if (confirm("Close and delete this guest's record?")) {
    db.collection("guests").doc(selectedGuestId).delete().then(() => {
      alert("Bill closed and deleted!");
      closeModals();
    });
  }
    }
