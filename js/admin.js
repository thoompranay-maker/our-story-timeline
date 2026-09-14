
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


// ======================================================
// PHOTO ELEMENTS
// ======================================================

const memoryPhoto =
    document.getElementById("memoryPhoto");

const photoPreview =
    document.getElementById("photoPreview");

const photoPreviewImage =
    document.getElementById("photoPreviewImage");

const removePhotoButton =
    document.getElementById("removePhotoButton");


let selectedPhotoFile = null;

let existingPhotoUrl = null;

let photoWasRemoved = false;


// ======================================================
// CHECK LOGIN
// ======================================================

async function checkAuthentication() {

    const { data, error } =
        await window.supabaseClient.auth.getSession();

    if (error || !data.session) {

        window.location.href = "login.html";

        return;
    }

    loadMemories();
}


// ======================================================
// LOAD MEMORIES
// ======================================================

async function loadMemories() {

    memoriesList.innerHTML =
        '<div class="loading">Loading memories...</div>';


    const ascending =
        sortOrder.value === "asc";


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

        console.error(error);

        memoriesList.innerHTML =
            `<div class="error">
                Unable to load memories.<br>
                ${escapeHTML(error.message)}
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


// ======================================================
// CREATE MEMORY CARD
// ======================================================

function createMemoryCard(memory) {

    const card =
        document.createElement("article");

    card.className = "memory-card";


    const date =
        formatDate(memory.event_date);


    const icon =
        getCategoryIcon(memory.category);


    const photoHTML =
        memory.photo_url
        ?
        `
        <div class="admin-memory-photo">

            <img
                src="${escapeAttribute(memory.photo_url)}"
                alt="${escapeAttribute(memory.title)}"
                loading="lazy"
            >

        </div>
        `
        :
        "";


    card.innerHTML = `

        ${photoHTML}

        <div class="memory-date">
            ${date}
        </div>

        <div class="memory-content">

            <div class="memory-category">
                ${icon}
                ${formatCategory(memory.category)}
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
            >
                Edit
            </button>

            <button
                class="delete-button"
            >
                Delete
            </button>

        </div>

    `;


    card.querySelector(".edit-button")
        .addEventListener(
            "click",
            () => editMemory(memory)
        );


    card.querySelector(".delete-button")
        .addEventListener(
            "click",
            () => deleteMemory(memory)
        );


    return card;

}


// ======================================================
// ADD MEMORY
// ======================================================

addMemoryButton.addEventListener(
    "click",
    () => openMemoryForm()
);


// ======================================================
// OPEN FORM
// ======================================================

function openMemoryForm(memory = null) {

    memoryForm.reset();


    document.getElementById("memoryId").value =
        memory ? memory.id : "";


    selectedPhotoFile = null;

    existingPhotoUrl =
        memory?.photo_url || null;

    photoWasRemoved = false;


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


        if (memory.photo_url) {

            showPhotoPreview(
                memory.photo_url
            );

        } else {

            hidePhotoPreview();

        }

    } else {

        hidePhotoPreview();

    }


    formMessage.textContent = "";

    memoryFormSection.classList.remove("hidden");

    memoryFormSection.scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================================
// PHOTO SELECT
// ======================================================

memoryPhoto.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {
            return;
        }


        // Maximum 5 MB

        if (file.size > 5 * 1024 * 1024) {

            alert(
                "This photo is larger than 5 MB. Please choose a smaller image."
            );

            this.value = "";

            return;
        }


        // Validate file type

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            alert(
                "Please choose a JPG, PNG or WebP image."
            );

            this.value = "";

            return;
        }


        selectedPhotoFile = file;

        photoWasRemoved = false;


        const previewUrl =
            URL.createObjectURL(file);


        showPhotoPreview(previewUrl);

    }
);


// ======================================================
// SHOW PHOTO
// ======================================================

function showPhotoPreview(source) {

    photoPreviewImage.src = source;

    photoPreview.classList.remove("hidden");

}


// ======================================================
// HIDE PHOTO
// ======================================================

function hidePhotoPreview() {

    photoPreviewImage.src = "";

    photoPreview.classList.add("hidden");

}


// ======================================================
// REMOVE PHOTO
// ======================================================

removePhotoButton.addEventListener(
    "click",
    function () {

        selectedPhotoFile = null;

        existingPhotoUrl = null;

        photoWasRemoved = true;

        memoryPhoto.value = "";

        hidePhotoPreview();

    }
);


// ======================================================
// CLOSE FORM
// ======================================================

function closeMemoryForm() {

    memoryFormSection.classList.add("hidden");

    memoryForm.reset();

    document.getElementById("memoryId").value = "";

    selectedPhotoFile = null;

    existingPhotoUrl = null;

    photoWasRemoved = false;

    hidePhotoPreview();

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


// ======================================================
// UPLOAD PHOTO
// ======================================================

async function uploadPhoto(file) {

    const fileExtension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const uniqueName =
        `${crypto.randomUUID()}.${fileExtension}`;


    const filePath =
        `${new Date().getFullYear()}/${uniqueName}`;


    const { error } =
        await window.supabaseClient
            .storage
            .from("memory-photos")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (error) {

        throw error;

    }


    const { data } =
        window.supabaseClient
            .storage
            .from("memory-photos")
            .getPublicUrl(filePath);


    return {
        path: filePath,
        url: data.publicUrl
    };

}


// ======================================================
// DELETE PHOTO FROM STORAGE
// ======================================================

async function deletePhotoFromStorage(
    photoUrl
) {

    if (!photoUrl) {
        return;
    }


    const marker =
        "/storage/v1/object/public/memory-photos/";


    const index =
        photoUrl.indexOf(marker);


    if (index === -1) {
        return;
    }


    const path =
        decodeURIComponent(
            photoUrl.substring(
                index + marker.length
            )
        );


    const { error } =
        await window.supabaseClient
            .storage
            .from("memory-photos")
            .remove([path]);


    if (error) {

        console.error(
            "Photo deletion error:",
            error
        );

    }

}


// ======================================================
// SAVE MEMORY
// ======================================================

memoryForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const memoryId =
            document.getElementById("memoryId").value;


        const title =
            document.getElementById("title")
                .value
                .trim();


        const eventDate =
            document.getElementById("eventDate")
                .value;


        if (!eventDate || !title) {

            formMessage.textContent =
                "Please enter the date and title.";

            return;
        }


        try {

            formMessage.textContent =
                selectedPhotoFile
                ?
                "Uploading photo..."
                :
                "Saving memory...";


            let photoUrl =
                existingPhotoUrl;


            let uploadedPhotoPath =
                null;


            // ------------------------------------------
            // UPLOAD NEW PHOTO
            // ------------------------------------------

            if (selectedPhotoFile) {

                const uploaded =
                    await uploadPhoto(
                        selectedPhotoFile
                    );


                photoUrl =
                    uploaded.url;


                uploadedPhotoPath =
                    uploaded.path;

            }


            // ------------------------------------------
            // REMOVE EXISTING PHOTO
            // ------------------------------------------

            if (
                memoryId &&
                photoWasRemoved &&
                existingPhotoUrl
            ) {

                await deletePhotoFromStorage(
                    existingPhotoUrl
                );

                photoUrl = null;

            }


            const memoryData = {

                event_date: eventDate,

                title: title,

                description:
                    document.getElementById(
                        "description"
                    ).value.trim(),

                category:
                    document.getElementById(
                        "category"
                    ).value,

                location:
                    document.getElementById(
                        "location"
                    ).value.trim(),

                photo_url: photoUrl,

                updated_at:
                    new Date().toISOString()

            };


            let result;


            // ------------------------------------------
            // UPDATE
            // ------------------------------------------

            if (memoryId) {

                result =
                    await window.supabaseClient
                        .from("memories")
                        .update(memoryData)
                        .eq("id", memoryId);

            }


            // ------------------------------------------
            // INSERT
            // ------------------------------------------

            else {

                result =
                    await window.supabaseClient
                        .from("memories")
                        .insert([
                            memoryData
                        ]);

            }


            // ------------------------------------------
            // DATABASE ERROR
            // ------------------------------------------

            if (result.error) {

                // Clean up newly uploaded photo
                if (uploadedPhotoPath) {

                    await window.supabaseClient
                        .storage
                        .from("memory-photos")
                        .remove([
                            uploadedPhotoPath
                        ]);

                }


                throw result.error;

            }


            formMessage.textContent =
                "Memory saved ❤️";


            setTimeout(() => {

                closeMemoryForm();

                loadMemories();

            }, 700);


        } catch (error) {

            console.error(
                "Save memory error:",
                error
            );


            formMessage.textContent =
                "Error: " +
                error.message;

        }

    }
);


// ======================================================
// EDIT
// ======================================================

function editMemory(memory) {

    openMemoryForm(memory);

}


// ======================================================
// DELETE MEMORY
// ======================================================

async function deleteMemory(memory) {

    const confirmed =
        confirm(
            `Delete "${memory.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await window.supabaseClient
            .from("memories")
            .delete()
            .eq("id", memory.id);


    if (error) {

        alert(
            "Unable to delete memory: " +
            error.message
        );

        return;
    }


    if (memory.photo_url) {

        await deletePhotoFromStorage(
            memory.photo_url
        );

    }


    loadMemories();

}


// ======================================================
// SORT
// ======================================================

sortOrder.addEventListener(
    "change",
    loadMemories
);


// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener(
    "click",
    async () => {

        await window.supabaseClient.auth.signOut();

        window.location.href =
            "login.html";

    }
);


// ======================================================
// HELPERS
// ======================================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


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


function formatCategory(category) {

    const names = {

        memory: "Memory",

        milestone: "Milestone",

        date: "Date",

        travel: "Travel",

        celebration: "Celebration",

        funny: "Funny",

        family: "Family"

    };


    return names[category] || "Memory";

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;

}


function escapeAttribute(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// ======================================================
// START
// ======================================================

checkAuthentication();
