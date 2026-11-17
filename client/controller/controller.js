const statusEl = document.getElementById("status");

document.getElementById("fire").addEventListener("click", async () => {
    try {
        const res = await fetch("/fire", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
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
