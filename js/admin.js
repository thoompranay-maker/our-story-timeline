/* =========================================================
   OUR STORY TIMELINE — ADMIN PANEL
   Fully matched to current admin.html + admin.css
   ========================================================= */


/* =========================================================
   1. DOM REFERENCES
   ========================================================= */

const addMemoryButton =
    document.getElementById("addMemoryButton");

const closeFormButton =
    document.getElementById("closeFormButton");

const memoryFormSection =
    document.getElementById("memoryFormSection");

const memoryForm =
    document.getElementById("memoryForm");

const memoryIdInput =
    document.getElementById("memoryId");

const eventDateInput =
    document.getElementById("eventDate");

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const categoryInput =
    document.getElementById("category");

const locationInput =
    document.getElementById("location");

const photoInput =
    document.getElementById("memoryPhoto");

const photoPreview =
    document.getElementById("photoPreview");

const photoPreviewImage =
    document.getElementById("photoPreviewImage");

const removePhotoButton =
    document.getElementById("removePhotoButton");

const cancelButton =
    document.getElementById("cancelButton");

const saveButton =
    memoryForm?.querySelector(
        'button[type="submit"]'
    );

const saveButtonLabel =
    saveButton?.querySelector(
        ".save-button-label"
    );

const formTitle =
    document.getElementById("formTitle");

const formEyebrow =
    document.getElementById("formEyebrow");

const formMessage =
    document.getElementById("formMessage");

const memoriesList =
    document.getElementById("memoriesList");

const memorySearch =
    document.getElementById("memorySearch");

const clearSearch =
    document.getElementById("clearSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortOrder =
    document.getElementById("sortOrder");

const visibleCount =
    document.getElementById("visibleCount");

const memoryCount =
    document.getElementById("memoryCount");

const milestoneCount =
    document.getElementById("milestoneCount");

const photoCount =
    document.getElementById("photoCount");

const archiveResultInfo =
    document.getElementById("archiveResultInfo");

const logoutButton =
    document.getElementById("logoutButton");

const deleteModal =
    document.getElementById("deleteModal");

const cancelDeleteButton =
    document.getElementById("cancelDeleteButton");

const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");

const deleteModalText =
    document.getElementById("deleteModalText");

const toast =
    document.getElementById("toast");


/* =========================================================
   2. STATE
   ========================================================= */

let allMemories = [];

let editingMemoryId = null;

let deletingMemoryId = null;

let selectedPhotoFile = null;

let existingPhotoUrl = null;

let photoWasRemoved = false;

let newlyUploadedPhotoUrl = null;


/* =========================================================
   3. INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdmin
);


async function initializeAdmin() {

    try {

        const authenticated =
            await checkAuthentication();

        if (!authenticated) {
            return;
        }


        setupMemoryForm();

        setupAddMemoryButton();

        setupPhotoUpload();

        setupSearch();

        setupFilters();

        setupSorting();

        setupDeleteModal();

        setupLogout();


        await loadMemories();


    } catch (error) {

        console.error(
            "Admin initialization error:",
            error
        );

        showError(
            "Unable to initialize the archive."
        );

    }

}


/* =========================================================
   4. AUTHENTICATION
   ========================================================= */

async function checkAuthentication() {

    if (
        !window.supabaseClient
    ) {

        console.error(
            "Supabase client is not available."
        );

        window.location.href =
            "login.html";

        return false;

    }


    const {
        data,
        error
    } =
        await window.supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Authentication error:",
            error
        );

        window.location.href =
            "login.html";

        return false;

    }


    if (!data?.session) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


/* =========================================================
   5. LOAD MEMORIES
   ========================================================= */

async function loadMemories() {

    showLoading();


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("memories")
                .select("*")
                .order(
                    "event_date",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Supabase memory query error:",
                error
            );

            showError(
                error.message ||
                "Unable to load memories."
            );

            return;

        }


        allMemories =
            Array.isArray(data)
                ? data
                : [];


        updateStatistics();

        renderMemories();


    } catch (error) {

        console.error(
            "Unexpected memory loading error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while loading memories."
        );

    }

}


/* =========================================================
   6. UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        allMemories.length;


    const milestones =
        allMemories.filter(
            memory =>
                String(
                    memory.category || ""
                ).toLowerCase() ===
                "milestone"
        ).length;


    const photographs =
        allMemories.filter(
            memory =>
                Boolean(
                    memory.photo_url
                )
        ).length;


    if (memoryCount) {

        memoryCount.textContent =
            total;

    }


    if (milestoneCount) {

        milestoneCount.textContent =
            milestones;

    }


    if (photoCount) {

        photoCount.textContent =
            photographs;

    }

}


/* =========================================================
   7. RENDER MEMORIES
   ========================================================= */

function renderMemories() {

    if (!memoriesList) {

        console.error(
            "memoriesList element not found."
        );

        return;

    }


    let filtered =
        [...allMemories];


    const searchTerm =
        memorySearch?.value
            ?.trim()
            .toLowerCase() ||
        "";


    const selectedCategory =
        categoryFilter?.value ||
        "all";


    const selectedSort =
        sortOrder?.value ||
        "asc";


    /* -----------------------------------------------------
       SEARCH
       ----------------------------------------------------- */

    if (searchTerm) {

        filtered =
            filtered.filter(
                memory => {

                    const searchableText = [

                        memory.title,

                        memory.description,

                        memory.location,

                        memory.category,

                        memory.event_date

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText
                        .includes(searchTerm);

                }
            );

    }


    /* -----------------------------------------------------
       CATEGORY FILTER
       ----------------------------------------------------- */

    if (
        selectedCategory !==
        "all"
    ) {

        filtered =
            filtered.filter(
                memory =>
                    String(
                        memory.category ||
                        ""
                    ).toLowerCase() ===
                    selectedCategory
                        .toLowerCase()
            );

    }


    /* -----------------------------------------------------
       SORT
       ----------------------------------------------------- */

    filtered.sort(
        (
            first,
            second
        ) => {

            const firstDate =
                parseDate(
                    first.event_date
                );

            const secondDate =
                parseDate(
                    second.event_date
                );


            if (
                selectedSort ===
                "desc"
            ) {

                return (
                    secondDate -
                    firstDate
                );

            }


            return (
                firstDate -
                secondDate
            );

        }
    );


    /* -----------------------------------------------------
       RESULT COUNTER
       ----------------------------------------------------- */

    updateVisibleCount(
        filtered.length
    );


    updateSearchResult(
        filtered.length,
        searchTerm
    );


    /* -----------------------------------------------------
       EMPTY STATE
       ----------------------------------------------------- */

    if (
        filtered.length === 0
    ) {

        showEmpty();

        return;

    }


    /* -----------------------------------------------------
       RENDER CARDS
       ----------------------------------------------------- */

    memoriesList.innerHTML =
        filtered
            .map(
                createMemoryCard
            )
            .join("");


    attachMemoryCardEvents();

}


/* =========================================================
   8. CREATE MEMORY CARD
   ========================================================= */

function createMemoryCard(
    memory
) {

    const date =
        formatDate(
            memory.event_date
        );


    const category =
        String(
            memory.category ||
            "memory"
        ).toLowerCase();


    const categoryLabel =
        getCategoryLabel(
            category
        );


    const categoryIcon =
        getCategoryIcon(
            category
        );


    const photoMarkup =
        memory.photo_url
            ? `
                <div class="admin-memory-photo">
                    <img
                        src="${escapeAttribute(
                            memory.photo_url
                        )}"
                        alt="${escapeAttribute(
                            memory.title ||
                            "Memory"
                        )}"
                        loading="lazy"
                        decoding="async"
                        onerror="
                            this.parentElement.style.display='none'
                        "
                    >
                </div>
            `
            : `
                <div
                    class="admin-memory-photo"
                    aria-hidden="true"
                >
                    ♡
                </div>
            `;


    const descriptionMarkup =
        memory.description
            ? `
                <p>
                    ${escapeHTML(
                        memory.description
                    )}
                </p>
            `
            : "";


    const locationMarkup =
        memory.location
            ? `
                <div class="memory-location">
                    ⌖
                    ${escapeHTML(
                        memory.location
                    )}
                </div>
            `
            : "";


    return `
        <article
            class="memory-card"
            data-memory-id="${escapeAttribute(
                memory.id
            )}"
        >

            ${photoMarkup}


            <div class="memory-content">

                <div class="memory-category">
                    <span aria-hidden="true">
                        ${categoryIcon}
                    </span>

                    ${escapeHTML(
                        categoryLabel
                    )}
                </div>


                <div class="memory-date">
                    ${escapeHTML(
                        date
                    )}
                </div>


                <h3>
                    ${escapeHTML(
                        memory.title ||
                        "Untitled memory"
                    )}
                </h3>


                ${descriptionMarkup}

                ${locationMarkup}

            </div>


            <div class="memory-actions">

                <button
                    type="button"
                    class="edit-button"
                    data-action="edit"
                    data-id="${escapeAttribute(
                        memory.id
                    )}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="delete-button"
                    data-action="delete"
                    data-id="${escapeAttribute(
                        memory.id
                    )}"
                >
                    Delete
                </button>

            </div>

        </article>
    `;

}


/* =========================================================
   9. MEMORY CARD EVENTS
   ========================================================= */

function attachMemoryCardEvents() {

    const editButtons =
        document.querySelectorAll(
            '[data-action="edit"]'
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    startEditingMemory(
                        button.dataset.id
                    );

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            '[data-action="delete"]'
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openDeleteModal(
                        button.dataset.id
                    );

                }
            );

        }
    );

}


/* =========================================================
   10. ADD MEMORY BUTTON
   ========================================================= */

function setupAddMemoryButton() {

    if (!addMemoryButton) {

        return;

    }


    addMemoryButton.addEventListener(
        "click",
        () => {

            resetForm();

            showMemoryForm();

            setTimeout(
                () => {

                    eventDateInput?.focus();

                },
                300
            );

        }
    );

}


/* =========================================================
   11. SHOW FORM
   ========================================================= */

function showMemoryForm() {

    if (!memoryFormSection) {

        return;

    }


    memoryFormSection.classList.remove(
        "hidden"
    );


    memoryFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   12. HIDE FORM
   ========================================================= */

function hideMemoryForm() {

    if (!memoryFormSection) {

        return;

    }


    memoryFormSection.classList.add(
        "hidden"
    );

}


/* =========================================================
   13. MEMORY FORM SETUP
   ========================================================= */

function setupMemoryForm() {

    if (!memoryForm) {

        return;

    }


    memoryForm.addEventListener(
        "submit",
        handleFormSubmit
    );


    closeFormButton?.addEventListener(
        "click",
        () => {

            resetForm();

            hideMemoryForm();

        }
    );


    cancelButton?.addEventListener(
        "click",
        () => {

            resetForm();

            hideMemoryForm();

        }
    );

}


/* =========================================================
   14. FORM SUBMIT
   ========================================================= */

async function handleFormSubmit(
    event
) {

    event.preventDefault();


    const eventDate =
        eventDateInput?.value
            ?.trim();


    const title =
        titleInput?.value
            ?.trim();


    const description =
        descriptionInput?.value
            ?.trim();


    const category =
        categoryInput?.value
            ?.trim() ||
        "memory";


    const location =
        locationInput?.value
            ?.trim();


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (!eventDate) {

        showFormMessage(
            "Please choose a date."
        );

        eventDateInput?.focus();

        return;

    }


    if (!title) {

        showFormMessage(
            "Please enter a title."
        );

        titleInput?.focus();

        return;

    }


    setSavingState(
        true
    );


    let uploadedPhotoUrl =
        null;


    try {

        /* -------------------------------------------------
           UPLOAD NEW PHOTO
           ------------------------------------------------- */

        if (selectedPhotoFile) {

            uploadedPhotoUrl =
                await uploadPhoto(
                    selectedPhotoFile
                );

            newlyUploadedPhotoUrl =
                uploadedPhotoUrl;

        }


        /* -------------------------------------------------
           DETERMINE PHOTO URL
           ------------------------------------------------- */

        let photoUrl =
            existingPhotoUrl;


        if (uploadedPhotoUrl) {

            photoUrl =
                uploadedPhotoUrl;

        }


        if (
            photoWasRemoved &&
            !uploadedPhotoUrl
        ) {

            photoUrl =
                null;

        }


        /* -------------------------------------------------
           PAYLOAD
           ------------------------------------------------- */

        const payload = {

            event_date:
                eventDate,

            title:
                title,

            description:
                description ||
                null,

            category:
                category,

            location:
                location ||
                null,

            photo_url:
                photoUrl

        };


        /* -------------------------------------------------
           INSERT / UPDATE
           ------------------------------------------------- */

        if (editingMemoryId) {

            await updateMemory(
                editingMemoryId,
                payload
            );

        } else {

            await createMemory(
                payload
            );

        }


        /* -------------------------------------------------
           DELETE OLD PHOTO IF REPLACED / REMOVED
           ------------------------------------------------- */

        if (
            editingMemoryId &&
            existingPhotoUrl &&
            (
                uploadedPhotoUrl ||
                photoWasRemoved
            )
        ) {

            try {

                await deletePhotoFromStorage(
                    existingPhotoUrl
                );

            } catch (
                photoCleanupError
            ) {

                console.warn(
                    "Old photo cleanup warning:",
                    photoCleanupError
                );

            }

        }


        showFormMessage(
            editingMemoryId
                ? "Memory updated."
                : "Memory preserved."
        );


        showToast(
            editingMemoryId
                ? "Memory updated successfully."
                : "Memory added to our story.",
            "success"
        );


        resetForm();

        hideMemoryForm();

        await loadMemories();


    } catch (error) {

        console.error(
            "Save memory error:",
            error
        );


        /*
         * If a new photo uploaded successfully
         * but the database operation failed,
         * remove the orphaned upload.
         */

        if (
            newlyUploadedPhotoUrl
        ) {

            try {

                await deletePhotoFromStorage(
                    newlyUploadedPhotoUrl
                );

            } catch (
                cleanupError
            ) {

                console.warn(
                    "Failed to clean uploaded photo:",
                    cleanupError
                );

            }

        }


        showFormMessage(
            error.message ||
            "Unable to save memory."
        );


        showToast(
            error.message ||
            "Unable to save memory.",
            "error"
        );

    } finally {

        setSavingState(
            false
        );

    }

}


/* =========================================================
   15. CREATE MEMORY
   ========================================================= */

async function createMemory(
    payload
) {

    const {
        error
    } =
        await window.supabaseClient
            .from("memories")
            .insert(
                payload
            );


    if (error) {

        throw error;

    }

}


/* =========================================================
   16. UPDATE MEMORY
   ========================================================= */

async function updateMemory(
    id,
    payload
) {

    const {
        error
    } =
        await window.supabaseClient
            .from("memories")
            .update(
                payload
            )
            .eq(
                "id",
                id
            );


    if (error) {

        throw error;

    }

}


/* =========================================================
   17. START EDITING
   ========================================================= */

function startEditingMemory(
    id
) {

    const memory =
        allMemories.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!memory) {

        showToast(
            "Memory not found.",
            "error"
        );

        return;

    }


    editingMemoryId =
        memory.id;


    existingPhotoUrl =
        memory.photo_url ||
        null;


    selectedPhotoFile =
        null;


    photoWasRemoved =
        false;


    newlyUploadedPhotoUrl =
        null;


    if (memoryIdInput) {

        memoryIdInput.value =
            memory.id;

    }


    if (eventDateInput) {

        eventDateInput.value =
            memory.event_date ||
            "";

    }


    if (titleInput) {

        titleInput.value =
            memory.title ||
            "";

    }


    if (descriptionInput) {

        descriptionInput.value =
            memory.description ||
            "";

    }


    if (categoryInput) {

        categoryInput.value =
            memory.category ||
            "memory";

    }


    if (locationInput) {

        locationInput.value =
            memory.location ||
            "";

    }


    if (
        memory.photo_url
    ) {

        showPhotoPreview(
            memory.photo_url
        );

    } else {

        hidePhotoPreview();

    }


    if (formTitle) {

        formTitle.textContent =
            "Edit your memory";

    }


    if (formEyebrow) {

        formEyebrow.textContent =
            "EDIT MEMORY";

    }


    if (saveButtonLabel) {

        saveButtonLabel.textContent =
            "Save Changes";

    }


    showMemoryForm();

}


/* =========================================================
   18. RESET FORM
   ========================================================= */

function resetForm() {

    editingMemoryId =
        null;


    existingPhotoUrl =
        null;


    selectedPhotoFile =
        null;


    photoWasRemoved =
        false;


    newlyUploadedPhotoUrl =
        null;


    memoryForm?.reset();


    if (memoryIdInput) {

        memoryIdInput.value =
            "";

    }


    if (formTitle) {

        formTitle.textContent =
            "Preserve a special moment";

    }


    if (formEyebrow) {

        formEyebrow.textContent =
            "NEW MEMORY";

    }


    if (saveButtonLabel) {

        saveButtonLabel.textContent =
            "Save Memory";

    }


    if (formMessage) {

        formMessage.textContent =
            "";

    }


    hidePhotoPreview();

}


/* =========================================================
   19. SAVE BUTTON STATE
   ========================================================= */

function setSavingState(
    isSaving
) {

    if (!saveButton) {

        return;

    }


    saveButton.disabled =
        isSaving;


    saveButton.classList.toggle(
        "is-saving",
        isSaving
    );


    if (saveButtonLabel) {

        if (isSaving) {

            saveButtonLabel.textContent =
                editingMemoryId
                    ? "Saving..."
                    : "Preserving...";

        } else {

            saveButtonLabel.textContent =
                editingMemoryId
                    ? "Save Changes"
                    : "Save Memory";

        }

    }

}


/* =========================================================
   20. PHOTO UPLOAD SETUP
   ========================================================= */

function setupPhotoUpload() {

    if (!photoInput) {

        return;

    }


    photoInput.addEventListener(
        "change",
        handlePhotoSelection
    );


    removePhotoButton?.addEventListener(
        "click",
        removeSelectedPhoto
    );

}


/* =========================================================
   21. PHOTO SELECTION
   ========================================================= */

function handlePhotoSelection(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    /* -----------------------------------------------------
       TYPE
       ----------------------------------------------------- */

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showToast(
            "Please choose a JPG, PNG or WebP image.",
            "error"
        );

        photoInput.value =
            "";

        return;

    }


    /* -----------------------------------------------------
       SIZE — 5 MB
       ----------------------------------------------------- */

    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        showToast(
            "Photograph must be smaller than 5 MB.",
            "error"
        );

        photoInput.value =
            "";

        return;

    }


    selectedPhotoFile =
        file;


    photoWasRemoved =
        false;


    const previewUrl =
        URL.createObjectURL(
            file
        );


    showPhotoPreview(
        previewUrl
    );


    if (photoPreviewImage) {

        photoPreviewImage.onload =
            () => {

                URL.revokeObjectURL(
                    previewUrl
                );

            };

    }

}


/* =========================================================
   22. SHOW PHOTO PREVIEW
   ========================================================= */

function showPhotoPreview(
    source
) {

    if (
        !photoPreview ||
        !photoPreviewImage
    ) {

        return;

    }


    photoPreviewImage.src =
        source;


    photoPreview.classList.remove(
        "hidden"
    );

}


/* =========================================================
   23. REMOVE PHOTO
   ========================================================= */

function removeSelectedPhoto() {

    selectedPhotoFile =
        null;


    photoWasRemoved =
        true;


    if (photoInput) {

        photoInput.value =
            "";

    }


    hidePhotoPreview();

}


/* =========================================================
   24. HIDE PHOTO PREVIEW
   ========================================================= */

function hidePhotoPreview() {

    if (photoPreview) {

        photoPreview.classList.add(
            "hidden"
        );

    }


    if (photoPreviewImage) {

        photoPreviewImage.src =
            "";

    }

}


/* =========================================================
   25. UPLOAD PHOTO TO SUPABASE
   ========================================================= */

async function uploadPhoto(
    file
) {

    const bucket =
        "memory-photos";


    const extension =
        getFileExtension(
            file.name
        );


    const uniqueName =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${extension}`;


    const filePath =
        `memories/${uniqueName}`;


    const {
        error
    } =
        await window.supabaseClient
            .storage
            .from(bucket)
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type
                }
            );


    if (error) {

        console.error(
            "Photo upload error:",
            error
        );

        throw new Error(
            error.message ||
            "Photograph upload failed."
        );

    }


    const {
        data
    } =
        window.supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(
                filePath
            );


    if (
        !data?.publicUrl
    ) {

        throw new Error(
            "Unable to create photograph URL."
        );

    }


    return data.publicUrl;

}


/* =========================================================
   26. DELETE PHOTO FROM STORAGE
   ========================================================= */

async function deletePhotoFromStorage(
    photoUrl
) {

    if (!photoUrl) {

        return;

    }


    const bucket =
        "memory-photos";


    const marker =
        `/storage/v1/object/public/${bucket}/`;


    const index =
        photoUrl.indexOf(
            marker
        );


    if (index === -1) {

        return;

    }


    const filePath =
        decodeURIComponent(
            photoUrl.substring(
                index +
                marker.length
            )
        );


    if (!filePath) {

        return;

    }


    const {
        error
    } =
        await window.supabaseClient
            .storage
            .from(bucket)
            .remove([
                filePath
            ]);


    if (error) {

        throw error;

    }

}


/* =========================================================
   27. DELETE MODAL
   ========================================================= */

function setupDeleteModal() {

    cancelDeleteButton?.addEventListener(
        "click",
        closeDeleteModal
    );


    confirmDeleteButton?.addEventListener(
        "click",
        confirmDelete
    );


    deleteModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                deleteModal
            ) {

                closeDeleteModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    deleteModal &&
                    !deleteModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeDeleteModal();

                }

            }

        }
    );

}


/* =========================================================
   28. OPEN DELETE MODAL
   ========================================================= */

function openDeleteModal(
    id
) {

    const memory =
        allMemories.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!memory) {

        return;

    }


    deletingMemoryId =
        memory.id;


    if (deleteModalText) {

        deleteModalText.textContent =
            `"${memory.title || "This memory"}" will be removed from your private archive.`;

    }


    deleteModal?.classList.remove(
        "hidden"
    );


    deleteModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    confirmDeleteButton?.focus();

}


/* =========================================================
   29. CLOSE DELETE MODAL
   ========================================================= */

function closeDeleteModal() {

    deletingMemoryId =
        null;


    deleteModal?.classList.add(
        "hidden"
    );


    deleteModal?.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   30. CONFIRM DELETE
   ========================================================= */

async function confirmDelete() {

    if (!deletingMemoryId) {

        return;

    }


    const id =
        deletingMemoryId;


    confirmDeleteButton.disabled =
        true;


    confirmDeleteButton.textContent =
        "Removing...";


    try {

        const memory =
            allMemories.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        const {
            error
        } =
            await window.supabaseClient
                .from("memories")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;

        }


        if (
            memory?.photo_url
        ) {

            try {

                await deletePhotoFromStorage(
                    memory.photo_url
                );

            } catch (
                photoError
            ) {

                console.warn(
                    "Photo cleanup warning:",
                    photoError
                );

            }

        }


        closeDeleteModal();


        showToast(
            "Memory removed from our story.",
            "success"
        );


        await loadMemories();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            error.message ||
            "Unable to remove memory.",
            "error"
        );

    } finally {

        confirmDeleteButton.disabled =
            false;

        confirmDeleteButton.textContent =
            "Remove Memory";

    }

}


/* =========================================================
   31. SEARCH
   ========================================================= */

function setupSearch() {

    if (!memorySearch) {

        return;

    }


    memorySearch.addEventListener(
        "input",
        () => {

            updateClearSearch();

            renderMemories();

        }
    );


    clearSearch?.addEventListener(
        "click",
        () => {

            memorySearch.value =
                "";

            updateClearSearch();

            renderMemories();

            memorySearch.focus();

        }
    );


    updateClearSearch();

}


/* =========================================================
   32. CLEAR SEARCH BUTTON
   ========================================================= */

function updateClearSearch() {

    if (!clearSearch) {

        return;

    }


    const hasSearch =
        Boolean(
            memorySearch?.value
                ?.trim()
        );


    clearSearch.classList.toggle(
        "hidden",
        !hasSearch
    );

}


/* =========================================================
   33. FILTERS
   ========================================================= */

function setupFilters() {

    categoryFilter?.addEventListener(
        "change",
        renderMemories
    );

}


/* =========================================================
   34. SORTING
   ========================================================= */

function setupSorting() {

    sortOrder?.addEventListener(
        "change",
        renderMemories
    );

}


/* =========================================================
   35. VISIBLE COUNT
   ========================================================= */

function updateVisibleCount(
    count
) {

    if (!visibleCount) {

        return;

    }


    visibleCount.textContent =
        `${count} ${
            count === 1
                ? "memory"
                : "memories"
        }`;

}


/* =========================================================
   36. SEARCH RESULT MESSAGE
   ========================================================= */

function updateSearchResult(
    count,
    searchTerm
) {

    if (!archiveResultInfo) {

        return;

    }


    if (!searchTerm) {

        archiveResultInfo.textContent =
            `${count} ${
                count === 1
                    ? "memory"
                    : "memories"
            }`;

        return;

    }


    if (count === 0) {

        archiveResultInfo.innerHTML =
            `No memories found for <strong>"${escapeHTML(
                searchTerm
            )}"</strong>`;

        return;

    }


    archiveResultInfo.innerHTML =
        `${count} ${
            count === 1
                ? "memory"
                : "memories"
        } found for <strong>"${escapeHTML(
            searchTerm
        )}"</strong>`;

}


/* =========================================================
   37. LOADING STATE
   ========================================================= */

function showLoading() {

    if (!memoriesList) {

        return;

    }


    memoriesList.innerHTML = `

        <div class="loading">

            <div
                class="state-heart"
                aria-hidden="true"
            >
                ♡
            </div>

            <div
                class="state-spinner"
                aria-hidden="true"
            ></div>

            <p>
                Gathering your memories...
            </p>

        </div>

    `;

}


/* =========================================================
   38. EMPTY STATE
   ========================================================= */

function showEmpty() {

    if (!memoriesList) {

        return;

    }


    memoriesList.innerHTML = `

        <div class="empty-state">

            <div aria-hidden="true">
                ♡
            </div>

            <h3>
                Nothing here yet.
            </h3>

            <p>
                Some stories are still waiting
                to be written.
            </p>

        </div>

    `;

}


/* =========================================================
   39. ERROR STATE
   ========================================================= */

function showError(
    message
) {

    if (!memoriesList) {

        return;

    }


    memoriesList.innerHTML = `

        <div class="error">

            <div
                class="state-heart"
                aria-hidden="true"
            >
                ♡
            </div>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <button
                type="button"
                class="secondary-button"
                id="retryMemoriesButton"
            >
                Try Again
            </button>

        </div>

    `;


    document
        .getElementById(
            "retryMemoriesButton"
        )
        ?.addEventListener(
            "click",
            loadMemories
        );

}


/* =========================================================
   40. FORM MESSAGE
   ========================================================= */

function showFormMessage(
    message
) {

    if (!formMessage) {

        return;

    }


    formMessage.textContent =
        message;

}


/* =========================================================
   41. TOAST
   ========================================================= */

function showToast(
    message,
    type = "info"
) {

    if (!toast) {

        console.log(
            `[${type}] ${message}`
        );

        return;

    }


    toast.textContent =
        message;


    toast.classList.remove(
        "show"
    );


    /*
     * Force browser to recognize
     * the state change before adding show.
     */

    void toast.offsetWidth;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );

}


/* =========================================================
   42. LOGOUT
   ========================================================= */

function setupLogout() {

    logoutButton?.addEventListener(
        "click",
        handleLogout
    );

}


async function handleLogout() {

    if (logoutButton) {

        logoutButton.disabled =
            true;

        const text =
            logoutButton.querySelector(
                "span"
            );

        if (text) {

            text.textContent =
                "Leaving...";

        }

    }


    try {

        const {
            error
        } =
            await window.supabaseClient
                .auth
                .signOut();


        if (error) {

            throw error;

        }


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showToast(
            "Unable to sign out.",
            "error"
        );


        if (logoutButton) {

            logoutButton.disabled =
                false;

            const text =
                logoutButton.querySelector(
                    "span"
                );

            if (text) {

                text.textContent =
                    "Log Out";

            }

        }

    }

}


/* =========================================================
   43. CATEGORY LABEL
   ========================================================= */

function getCategoryLabel(
    category
) {

    const labels = {

        memory:
            "Memory",

        milestone:
            "Milestone",

        date:
            "Date",

        travel:
            "Travel",

        celebration:
            "Celebration",

        funny:
            "Funny",

        family:
            "Family"

    };


    return (
        labels[
            category
        ] ||
        capitalize(
            category
        )
    );

}


/* =========================================================
   44. CATEGORY ICON
   ========================================================= */

function getCategoryIcon(
    category
) {

    const icons = {

        memory:
            "♡",

        milestone:
            "◇",

        date:
            "🌹",

        travel:
            "✈",

        celebration:
            "✦",

        funny:
            "☻",

        family:
            "⌂"

    };


    return (
        icons[
            category
        ] ||
        "♡"
    );

}


/* =========================================================
   45. DATE PARSER
   ========================================================= */

function parseDate(
    value
) {

    if (!value) {

        return 0;

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    const time =
        date.getTime();


    return Number.isNaN(
        time
    )
        ? 0
        : time;

}


/* =========================================================
   46. DATE FORMATTER
   ========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "";

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"
        }
    ).format(
        date
    );

}


/* =========================================================
   47. FILE EXTENSION
   ========================================================= */

function getFileExtension(
    fileName
) {

    const parts =
        String(
            fileName
        ).split(".");


    if (
        parts.length < 2
    ) {

        return "jpg";

    }


    return (
        parts
            .pop()
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            ) ||
        "jpg"
    );

}


/* =========================================================
   48. CAPITALIZE
   ========================================================= */

function capitalize(
    value
) {

    const text =
        String(
            value || ""
        );


    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   49. ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   50. ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   51. AUTH STATE LISTENER
   ========================================================= */

if (
    window.supabaseClient
) {

    window.supabaseClient
        .auth
        .onAuthStateChange(
            (
                event
            ) => {

                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    window.location.href =
                        "login.html";

                }

            }
        );

}


/* =========================================================
   END OF ADMIN.JS
   ========================================================= */
