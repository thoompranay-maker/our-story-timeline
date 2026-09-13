const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = loginForm.querySelector("button");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Basic validation
    if (!email || !password) {
        loginMessage.textContent = "Please enter your email and password.";
        return;
    }

    loginMessage.textContent = "Signing in...";
    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error("Supabase Login Error:", error);

            loginMessage.textContent = error.message;

            loginButton.disabled = false;
            loginButton.textContent = "Enter Our Story";

            return;
        }

        console.log("Login successful:", data);

        loginMessage.textContent = "Login successful ❤️";

        window.location.href = "admin.html";

    } catch (error) {

        console.error("Unexpected Login Error:", error);

        loginMessage.textContent =
            "Something went wrong. Please check your Supabase configuration.";

        loginButton.disabled = false;
        loginButton.textContent = "Enter Our Story";
    }

});
