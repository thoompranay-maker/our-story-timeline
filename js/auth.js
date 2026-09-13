const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = loginForm.querySelector("button");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Signing in...";

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {

        const { data, error } =
            await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {

            console.error("Supabase Login Error:", error);

            loginMessage.textContent =
                "Login failed: " + error.message;

            loginButton.disabled = false;
            loginButton.textContent = "Enter Our Story";

            return;
        }

        console.log("Login successful:", data);

        loginMessage.textContent = "Login successful ❤️";

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 500);

    } catch (error) {

        console.error("Connection Error:", error);

        loginMessage.textContent =
            "Connection error: " +
            (error.message || "Unable to connect to Supabase.");

        loginButton.disabled = false;
        loginButton.textContent = "Enter Our Story";
    }

});
