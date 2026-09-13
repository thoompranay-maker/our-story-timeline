const memoryForm = document.getElementById("memoryForm");

const memoryFormSection =
    document.getElementById("memoryFormSection");

const addMemoryButton =
    document.getElementById("addMemoryButton");

const closeFormButton =
    document.getElementById("closeFormButton");

const cancelButton =
    document.getElementById("cancelButton");

const logoutButton =
    document.getElementById("logoutButton");

const memoriesList =
    document.getElementById("memoriesList");

const sortOrder =
    document.getElementById("sortOrder");

const formMessage =
    document.getElementById("formMessage");


// --------------------------------------------------
// CHECK LOGIN
// --------------------------------------------------

async function checkAuthentication() {

    const { data, error } =
        await window.supabaseClient.auth.getSession();

    if (error) {

        console.error(error);

        window.location.href = "login.html";

        return;
    }

    if (!data.session) {

        window.location.href = "login.html";

        return;
    }

    console.log("Authenticated user:", data.session.user.email);

    loadMemories();
}


// --------------------------------------------------
// LOAD MEMORIES
// --------------------------------------------------

async function loadMemories() {

    memoriesList.innerHTML =
        '<div class="loading">Loading memories...</div>';

    const ascending = sortOrder.value === "asc";

    const { data, error } =
        await window.supabaseClient
            .from("memories")
            .select("*")
            .order("event_date", {
                ascending: ascending
            })
            .order("created_at", {
                ascending: ascending
            });


    if (error) {

        console.error("Load memories error:", error);

        memoriesList.innerHTML =
            `<div class="error">
                Unable to load memories.<br>
                ${error.message}
            </div>`;

        return;
    }


    if (!data || data.length === 0) {

        memoriesList.innerHTML =
            `<div class="empty-state">
                <div>♡</div>
                <h3>No memories yet</h3>
                <p>Your story is waiting to be written.</p>
            </div>`;

        return;
    }


    memoriesList.innerHTML = "";

    data.forEach(memory => {

        memoriesList.appendChild(
            createMemoryCard(memory)
        );

    });
}


// --------------------------------------------------
// CREATE MEMORY CARD
// --------------------------------------------------

function createMemoryCard(memory) {

    const card = document.createElement("article");

    card.className = "memory-card";

    const date = formatDate(memory.event_date);

    card.innerHTML = `

        <div class="memory-date">
            ${date}
        </div>

        <div class="memory-content">

            <div class="memory-category">
                ${getCategoryIcon(memory.category)}
                ${memory.category || "memory"}
            </div>

            <h3>
                ${escapeHTML(memory.title)}
            </h3>

            ${
                memory.description
                ?
                `<p>
                    ${escapeHTML(memory.description)}
                </p>`
                :
                ""
            }

            ${
                memory.location
                ?
                `<div class="memory-location">
                    📍 ${escapeHTML(memory.location)}
                </div>`
                :
                ""
            }

        </div>

        <div class="memory-actions">

            <button
                class="edit-button"
                data-id="${memory.id}"
            >
                Edit
            </button>

            <button
                class="delete-button"
                data-id="${memory.id}"
            >
                Delete
            </button>

        </div>

    `;


    card.querySelector(".edit-button")
        .addEventListener("click", () => {

            editMemory(memory);

        });


    card.querySelector(".delete-button")
        .addEventListener("click", () => {

            deleteMemory(memory.id);

        });


    return card;
}


// --------------------------------------------------
// ADD MEMORY
// --------------------------------------------------

addMemoryButton.addEventListener("click", () => {

    openMemoryForm();

});


// --------------------------------------------------
// OPEN FORM
// --------------------------------------------------

function openMemoryForm(memory = null) {

    memoryForm.reset();

    document.getElementById("memoryId").value =
        memory ? memory.id : "";

    if (memory) {

        document.getElementById("eventDate").value =
            memory.event_date;

        document.getElementById("title").value =
            memory.title;

        document.getElementById("description").value =
            memory.description || "";

        document.getElementById("category").value =
            memory.category || "memory";

        document.getElementById("location").value =
            memory.location || "";

    }

    formMessage.textContent = "";

    memoryFormSection.classList.remove("hidden");

    memoryFormSection.scrollIntoView({
        behavior: "smooth"
    });
}


// --------------------------------------------------
// CLOSE FORM
// --------------------------------------------------

function closeMemoryForm() {

    memoryFormSection.classList.add("hidden");

    memoryForm.reset();

    document.getElementById("memoryId").value = "";

    formMessage.textContent = "";
}


closeFormButton.addEventListener(
    "click",
    closeMemoryForm
);

cancelButton.addEventListener(
    "click",
    closeMemoryForm
);


// --------------------------------------------------
// SAVE MEMORY
// --------------------------------------------------

memoryForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const memoryId =
            document.getElementById("memoryId").value;

        const memoryData = {

            event_date:
                document.getElementById("eventDate").value,

            title:
                document.getElementById("title").value.trim(),

            description:
                document.getElementById("description").value.trim(),

            category:
                document.getElementById("category").value,

            location:
                document.getElementById("location").value.trim(),

            updated_at:
                new Date().toISOString()

        };


        formMessage.textContent =
            "Saving memory...";


        let result;


        if (memoryId) {

            // EDIT

            result =
                await window.supabaseClient
                    .from("memories")
                    .update(memoryData)
                    .eq("id", memoryId);

        } else {

            // CREATE

            result =
                await window.supabaseClient
                    .from("memories")
                    .insert([memoryData]);

        }


        if (result.error) {

            console.error(result.error);

            formMessage.textContent =
                "Error: " + result.error.message;

            return;
        }


        formMessage.textContent =
            "Memory saved ❤️";


        setTimeout(() => {

            closeMemoryForm();

            loadMemories();

        }, 500);

    }
);


// --------------------------------------------------
// EDIT MEMORY
// --------------------------------------------------

function editMemory(memory) {

    openMemoryForm(memory);

}


// --------------------------------------------------
// DELETE MEMORY
// --------------------------------------------------

async function deleteMemory(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this memory?"
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await window.supabaseClient
            .from("memories")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "Unable to delete memory: " +
            error.message
        );

        console.error(error);

        return;
    }


    loadMemories();
}


// --------------------------------------------------
// SORT
// --------------------------------------------------

sortOrder.addEventListener(
    "change",
    loadMemories
);


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

logoutButton.addEventListener(
    "click",
    async () => {

        await window.supabaseClient.auth.signOut();

        window.location.href = "login.html";

    }
);


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function getCategoryIcon(category) {

    const icons = {

        memory: "❤️",

        milestone: "💍",

        date: "🌹",

        travel: "✈️",

        celebration: "🎉",

        funny: "😂",

        family: "🏡"

    };

    return icons[category] || "❤️";

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;

}


// --------------------------------------------------
// START
// --------------------------------------------------

checkAuthentication();
