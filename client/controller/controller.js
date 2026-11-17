const statusEl = document.getElementById("status");
const toSelect = document.getElementById("to");

async function loadUsers() {
    const names = await (await fetch("/users")).json();
    const current = toSelect.value;
    toSelect.innerHTML = '<option value="">Everyone</option>';
    for (const name of names) {
        const opt = document.createElement("option");
        opt.value = opt.textContent = name;
        toSelect.appendChild(opt);
    }
    toSelect.value = names.includes(current) ? current : "";
}

document.getElementById("refresh").addEventListener("click", loadUsers);
loadUsers();

document.getElementById("fire").addEventListener("click", async () => {
    try {
        const res = await fetch("/fire", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                to: document.getElementById("to").value,
                title: document.getElementById("title").value,
                body: document.getElementById("body").value
            })
        });
        const { sent, total } = await res.json();
        statusEl.textContent = `Sent to ${sent}/${total} subscriber(s)`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Error: " + err.message;
    }
});
