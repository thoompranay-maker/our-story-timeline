const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = loginForm.querySelector("button");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Connecting to Our Story...";

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {

        console.log("Starting Supabase login...");
        console.log("Supabase URL:", SUPABASE_URL);
        console.log("Email:", email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        console.log("Supabase response:", data);
        console.log("Supabase error:", error);

        if (error) {

            loginMessage.textContent =
                "Login failed: " + error.message;

            console.error("SUPABASE AUTH ERROR:", error);

            loginButton.disabled = false;
            loginButton.textContent = "Enter Our Story";

            return;
        }

        loginMessage.textContent = "Login successful ❤️";

        console.log("USER:", data.user);

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 500);

    } catch (error) {

        console.error("CRITICAL ERROR:", error);

        loginMessage.innerHTML =
            "<strong>Connection error</strong><br>" +
            (error.message || error);

        loginButton.disabled = false;
        loginButton.textContent = "Enter Our Story";
    }

});
