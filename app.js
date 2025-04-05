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

let selectedGuestId = null;
let selectedGuestName = "";

function openModal(id) {
  document.getElementById("overlay").style.display = "block";
  document.getElementById(id).style.display = "block";
}
function closeModals() {
  document.getElementById("overlay").style.display = "none";
  document.querySelectorAll(".modal").forEach(modal => modal.style.display = "none");
}

function openNewGuest() {
  openModal("newGuestModal");
}
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
    alert("Guest saved.");
    closeModals();
  });
}

function openStayingGuest() {
  const guestListDiv = document.getElementById("guestList");
  guestListDiv.innerHTML = "";
  db.collection("guests").get().then(snapshot => {
    snapshot.forEach(doc => {
      const btn = document.createElement("button");
      btn.innerText = doc.data().name;
      btn.onclick = () => selectGuest(doc.id, doc.data().name);
      guestListDiv.appendChild(btn);
    });
    openModal("guestListModal");
  });
}

function selectGuest(id, name) {
  selectedGuestId = id;
  selectedGuestName = name;
  document.getElementById("selectedGuestName").innerText = name;
  closeModals();
  openModal("guestOptionsModal");
}

function openAddBill() {
  openModal("addBillModal");
}
function saveBill() {
  const item = document.getElementById("billItem").value;
  const extra = parseFloat(document.getElementById("extraBill").value);

  const guestRef = db.collection("guests").doc(selectedGuestId);
  guestRef.get().then(doc => {
    const data = doc.data();
    const newTotal = data.total + extra;
    const newBalance = newTotal - data.advance;
    const updatedBills = data.bills || [];
    updatedBills.push({ item, amount: extra });

    guestRef.update({
      total: newTotal,
      balance: newBalance,
      bills: updatedBills
    }).then(() => {
      alert("Bill updated.");
      closeModals();
    });
  });
}

function viewBill() {
  const guestRef = db.collection("guests").doc(selectedGuestId);
  guestRef.get().then(doc => {
    const data = doc.data();
    let billText = `
Name: ${data.name}
Phone: ${data.number}
Total: ₹${data.total}
Advance: ₹${data.advance}
Balance: ₹${data.balance}
-------------------------`;

    if (data.bills && data.bills.length > 0) {
      data.bills.forEach(bill => {
        billText += `\n${bill.item}: ₹${bill.amount}`;
      });
    } else {
      billText += `\nNo additional items.`;
    }

    document.getElementById("billSummary").innerText = billText;
    openModal("viewBillModal");
  });
}

function closeBill() {
  if (confirm("Are you sure you want to close and delete this guest's bill?")) {
    db.collection("guests").doc(selectedGuestId).delete().then(() => {
      alert("Guest bill closed and deleted.");
      closeModals();
    });
  }
}
