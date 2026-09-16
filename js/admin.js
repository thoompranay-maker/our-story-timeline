/* =========================================================
   OUR STORY TIMELINE — ADMIN PANEL
   Premium Admin Experience
   ========================================================= */


/* =========================================================
   1. DOM REFERENCES
   ========================================================= */

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
    document.getElementById("photo");

const photoPreview =
    document.getElementById("photoPreview");

const photoPreviewImage =
    document.getElementById("photoPreviewImage");

const removePhotoButton =
    document.getElementById("removePhoto");

const existingPhotoUrlInput =
    document.getElementById("existingPhotoUrl");

const submitButton =
    document.getElementById("saveMemory");

const cancelEditButton =
    document.getElementById("cancelEdit");

const formTitle =
    document.getElementById("formTitle");

const memoryList =
    document.getElementById("memoryList");

const memorySearch =
    document.getElementById("memorySearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortMemories =
    document.getElementById("sortMemories");

const logoutButton =
    document.getElementById("logoutButton");

const memoryCount =
    document.getElementById("memoryCount");

const milestoneCount =
    document.getElementById("milestoneCount");

const photoCount =
    document.getElementById("photoCount");

const archiveResultInfo =
    document.getElementById("archiveResultInfo");

const deleteModal =
    document.getElementById("deleteModal");

const deleteModalCancel =
    document.getElementById("deleteModalCancel");

const deleteModalConfirm =
    document.getElementById("deleteModalConfirm");

const toastContainer =
    document.getElementById("toastContainer");


/* =========================================================
   2. STATE
   ========================================================= */

let allMemories = [];

let editingMemoryId = null;

let deletingMemoryId = null;

let selectedPhotoFile = null;

let removeExistingPhoto = false;


/* =========================================================
   3. INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAdmin();

    }
);


/* =========================================================
   4. INITIALIZE ADMIN
   ========================================================= */

async function initializeAdmin() {

    try {

        await checkAuthentication();

        setupForm();

        setupPhotoUpload();

        setupSearch();

        setupCategoryFilter();

        setupSorting();

        setupLogout();

        setupDeleteModal();

        loadMemories();

    } catch (error) {

        console.error(
            "Admin initialization error:",
            error
        );

        showToast(
            "Unable to initialize the admin panel.",
            "error"
        );

    }

}


/* =========================================================
   5. AUTHENTICATION
   ========================================================= */

async function checkAuthentication() {

    const {
        data,
        error
    } =
        await window.supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        window.location.href =
            "login.html";

        return;

    }


    const session =
        data?.session;


    if (!session) {

        window.location.href =
            "login.html";

        return;

    }

}


/* =========================================================
   6. LOAD MEMORIES
   ========================================================= */

async function loadMemories() {

    showLoadingState();

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
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Load memories error:",
                error
            );

            showErrorState(
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
            "Unexpected load error:",
            error
        );

        showErrorState(
            "Something went wrong while loading the archive."
        );

    }

}


/* =========================================================
   7. UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        allMemories.length;


    const milestones =
        allMemories.filter(
            memory =>
                String(
                    memory.category || ""
                ).toLowerCase() === "milestone"
        ).length;


    const photos =
        allMemories.filter(
            memory =>
                Boolean(
                    memory.photo_url
                )
        ).length;


    if (memoryCount) {

        animateNumber(
            memoryCount,
            total
        );

    }


    if (milestoneCount) {

        animateNumber(
            milestoneCount,
            milestones
        );

    }


    if (photoCount) {

        animateNumber(
            photoCount,
            photos
        );

    }

}


/* =========================================================
   8. NUMBER ANIMATION
   ========================================================= */

function animateNumber(
    element,
    target
) {

    const duration = 500;

    const startTime =
        performance.now();


    function update(
        currentTime
    ) {

        const elapsed =
            currentTime -
            startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        element.textContent =
            Math.round(
                target * eased
            );


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/* =========================================================
   9. RENDER MEMORIES
   ========================================================= */

function renderMemories() {

    let filtered =
        [...allMemories];


    const searchTerm =
        memorySearch
            ?.value
            ?.trim()
            .toLowerCase() || "";


    const category =
        categoryFilter
            ?.value
            ?.trim()
            .toLowerCase() || "";


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


    if (
        category &&
        category !== "all"
    ) {

        filtered =
            filtered.filter(
                memory =>
                    String(
                        memory.category || ""
                    ).toLowerCase() ===
                    category
            );

    }


    const sortValue =
        sortMemories
            ?.value || "newest";


    filtered.sort(
        (
            first,
            second
        ) => {

            const dateA =
                parseDate(
                    first.event_date
                );

            const dateB =
                parseDate(
                    second.event_date
                );


            if (
                sortValue === "oldest"
            ) {

                return dateA - dateB;

            }


            if (
                sortValue === "title"
            ) {

                return String(
                    first.title || ""
                ).localeCompare(
                    String(
                        second.title || ""
                    )
                );

            }


            return dateB - dateA;

        }
    );


    updateArchiveResultInfo(
        filtered.length,
        searchTerm
    );


    if (!memoryList) {

        return;

    }


    if (!filtered.length) {

        showEmptyState();

        return;

    }


    memoryList.innerHTML =
        filtered
            .map(
                memory =>
                    createMemoryCard(
                        memory
                    )
            )
            .join("");


    attachMemoryCardEvents();

}


/* =========================================================
   10. CREATE MEMORY CARD
   ========================================================= */

function createMemoryCard(
    memory
) {

    const date =
        formatDisplayDate(
            memory.event_date
        );


    const category =
        String(
            memory.category ||
            "memory"
        );


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
            : "";


    const description =
        memory.description
            ? `
                <p class="admin-memory-description">
                    ${escapeHTML(
                        memory.description
                    )}
                </p>
            `
            : "";


    const location =
        memory.location
            ? `
                <div class="admin-memory-location">
                    <span aria-hidden="true">⌖</span>
                    <span>
                        ${escapeHTML(
                            memory.location
                        )}
                    </span>
                </div>
            `
            : "";


    return `
        <article
            class="admin-memory-card"
            data-memory-id="${escapeAttribute(
                memory.id
            )}"
        >

            ${photoMarkup}

            <div class="admin-memory-content">

                <div class="admin-memory-top">

                    <div class="admin-memory-category">
                        <span
                            class="admin-memory-category-icon"
                            aria-hidden="true"
                        >
                            ${categoryIcon}
                        </span>

                        <span>
                            ${escapeHTML(
                                categoryLabel
                            )}
                        </span>
                    </div>

                    <time
                        class="admin-memory-date"
                        datetime="${escapeAttribute(
                            memory.event_date ||
                            ""
                        )}"
                    >
                        ${escapeHTML(date)}
                    </time>

                </div>


                <h3 class="admin-memory-title">
                    ${escapeHTML(
                        memory.title ||
                        "Untitled memory"
                    )}
                </h3>


                ${description}

                ${location}


                <div class="admin-memory-actions">

                    <button
                        type="button"
                        class="admin-action-button edit-memory"
                        data-id="${escapeAttribute(
                            memory.id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="admin-action-button delete-memory"
                        data-id="${escapeAttribute(
                            memory.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   11. ATTACH CARD EVENTS
   ========================================================= */

function attachMemoryCardEvents() {

    document
        .querySelectorAll(
            ".edit-memory"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        startEditingMemory(
                            id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".delete-memory"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        openDeleteModal(
                            id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   12. SETUP FORM
   ========================================================= */

function setupForm() {

    if (!memoryForm) {

        return;

    }


    memoryForm.addEventListener(
        "submit",
        handleFormSubmit
    );


    if (cancelEditButton) {

        cancelEditButton.addEventListener(
            "click",
            cancelEditing
        );

    }

}


/* =========================================================
   13. HANDLE FORM SUBMIT
   ========================================================= */

async function handleFormSubmit(
    event
) {

    event.preventDefault();


    const eventDate =
        eventDateInput
            ?.value
            ?.trim();


    const title =
        titleInput
            ?.value
            ?.trim();


    const description =
        descriptionInput
            ?.value
            ?.trim();


    const category =
        categoryInput
            ?.value
            ?.trim() ||
        "memory";


    const location =
        locationInput
            ?.value
            ?.trim();


    if (!eventDate) {

        showToast(
            "Please choose a date.",
            "error"
        );

        eventDateInput?.focus();

        return;

    }


    if (!title) {

        showToast(
            "Please enter a memory title.",
            "error"
        );

        titleInput?.focus();

        return;

    }


    setFormLoading(
        true
    );


    try {

        let photoUrl =
            existingPhotoUrlInput
                ?.value
                ?.trim() || null;


        /*
         * If the user selected a new photo,
         * upload it before saving the memory.
         */

        if (selectedPhotoFile) {

            photoUrl =
                await uploadPhoto(
                    selectedPhotoFile
                );

        }


        /*
         * If editing and the existing photo
         * was explicitly removed.
         */

        if (
            editingMemoryId &&
            removeExistingPhoto
        ) {

            photoUrl = null;

        }


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


        resetForm();

        await loadMemories();

    } catch (error) {

        console.error(
            "Save memory error:",
            error
        );

        showToast(
            error?.message ||
            "Unable to save memory.",
            "error"
        );

    } finally {

        setFormLoading(
            false
        );

    }

}


/* =========================================================
   14. CREATE MEMORY
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


    showToast(
        "Memory added to our story.",
        "success"
    );

}


/* =========================================================
   15. UPDATE MEMORY
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


    showToast(
        "Memory updated successfully.",
        "success"
    );

}


/* =========================================================
   16. START EDITING
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
            "Memory could not be found.",
            "error"
        );

        return;

    }


    editingMemoryId =
        memory.id;


    removeExistingPhoto =
        false;


    selectedPhotoFile =
        null;


    if (memoryIdInput) {

        memoryIdInput.value =
            memory.id;

    }


    if (eventDateInput) {

        eventDateInput.value =
            memory.event_date || "";

    }


    if (titleInput) {

        titleInput.value =
            memory.title || "";

    }


    if (descriptionInput) {

        descriptionInput.value =
            memory.description || "";

    }


    if (categoryInput) {

        categoryInput.value =
            memory.category ||
            "memory";

    }


    if (locationInput) {

        locationInput.value =
            memory.location || "";

    }


    if (existingPhotoUrlInput) {

        existingPhotoUrlInput.value =
            memory.photo_url || "";

    }


    if (
        memory.photo_url &&
        photoPreview &&
        photoPreviewImage
    ) {

        photoPreviewImage.src =
            memory.photo_url;

        photoPreview.classList.remove(
            "hidden"
        );

    } else {

        hidePhotoPreview();

    }


    if (formTitle) {

        formTitle.textContent =
            "Edit Memory";

    }


    if (submitButton) {

        submitButton.textContent =
            "Save Changes";

    }


    if (cancelEditButton) {

        cancelEditButton.classList.remove(
            "hidden"
        );

    }


    /*
     * Scroll to form.
     */

    const formSection =
        memoryForm?.closest(
            "section"
        ) ||
        memoryForm;


    formSection?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    setTimeout(
        () => {

            titleInput?.focus();

        },
        500
    );

}


/* =========================================================
   17. CANCEL EDITING
   ========================================================= */

function cancelEditing() {

    resetForm();

    showToast(
        "Editing cancelled.",
        "info"
    );

}


/* =========================================================
   18. RESET FORM
   ========================================================= */

function resetForm() {

    editingMemoryId =
        null;


    selectedPhotoFile =
        null;


    removeExistingPhoto =
        false;


    if (memoryForm) {

        memoryForm.reset();

    }


    if (memoryIdInput) {

        memoryIdInput.value =
            "";

    }


    if (existingPhotoUrlInput) {

        existingPhotoUrlInput.value =
            "";

    }


    hidePhotoPreview();


    if (formTitle) {

        formTitle.textContent =
            "Add a Memory";

    }


    if (submitButton) {

        submitButton.textContent =
            "Save Memory";

    }


    if (cancelEditButton) {

        cancelEditButton.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   19. FORM LOADING STATE
   ========================================================= */

function setFormLoading(
    loading
) {

    if (!submitButton) {

        return;

    }


    submitButton.disabled =
        loading;


    if (loading) {

        submitButton.dataset.originalText =
            submitButton.textContent;

        submitButton.textContent =
            editingMemoryId
                ? "Saving..."
                : "Adding...";

    } else {

        submitButton.textContent =
            submitButton.dataset.originalText ||
            (
                editingMemoryId
                    ? "Save Changes"
                    : "Save Memory"
            );

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


    if (removePhotoButton) {

        removePhotoButton.addEventListener(
            "click",
            handlePhotoRemoval
        );

    }

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


    /*
     * File type validation.
     */

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please select an image file.",
            "error"
        );

        photoInput.value =
            "";

        return;

    }


    /*
     * Maximum 10 MB.
     */

    const maxSize =
        10 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        showToast(
            "Image must be smaller than 10 MB.",
            "error"
        );

        photoInput.value =
            "";

        return;

    }


    selectedPhotoFile =
        file;


    removeExistingPhoto =
        false;


    const objectUrl =
        URL.createObjectURL(
            file
        );


    if (
        photoPreview &&
        photoPreviewImage
    ) {

        photoPreviewImage.src =
            objectUrl;

        photoPreview.classList.remove(
            "hidden"
        );


        photoPreviewImage.onload =
            () => {

                URL.revokeObjectURL(
                    objectUrl
                );

            };

    }

}


/* =========================================================
   22. REMOVE PHOTO
   ========================================================= */

function handlePhotoRemoval() {

    selectedPhotoFile =
        null;


    if (photoInput) {

        photoInput.value =
            "";

    }


    if (editingMemoryId) {

        removeExistingPhoto =
            true;

    }


    hidePhotoPreview();

}


/* =========================================================
   23. HIDE PHOTO PREVIEW
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
   24. UPLOAD PHOTO
   ========================================================= */

async function uploadPhoto(
    file
) {

    const bucketName =
        "memory-photos";


    /*
     * Create a unique filename.
     */

    const extension =
        getFileExtension(
            file.name
        );


    const randomPart =
        Math.random()
            .toString(36)
            .substring(
                2,
                10
            );


    const timestamp =
        Date.now();


    const fileName =
        `${timestamp}-${randomPart}.${extension}`;


    const filePath =
        `memories/${fileName}`;


    const {
        error
    } =
        await window.supabaseClient
            .storage
            .from(bucketName)
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
            "Photo upload failed."
        );

    }


    const {
        data
    } =
        window.supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(
                filePath
            );


    if (
        !data ||
        !data.publicUrl
    ) {

        throw new Error(
            "Unable to create photo URL."
        );

    }


    return data.publicUrl;

}


/* =========================================================
   25. DELETE MEMORY
   ========================================================= */

async function deleteMemory(
    id
) {

    const memory =
        allMemories.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!memory) {

        throw new Error(
            "Memory not found."
        );

    }


    /*
     * Delete database record first.
     */

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


    /*
     * Remove associated photo
     * from storage if possible.
     */

    if (
        memory.photo_url
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


    showToast(
        "Memory removed from our story.",
        "success"
    );


    deletingMemoryId =
        null;


    closeDeleteModal();


    await loadMemories();

}


/* =========================================================
   26. DELETE PHOTO FROM STORAGE
   ========================================================= */

async function deletePhotoFromStorage(
    photoUrl
) {

    const bucketName =
        "memory-photos";


    /*
     * Only attempt deletion when
     * the URL belongs to our bucket.
     */

    if (
        !photoUrl.includes(
            `/storage/v1/object/public/${bucketName}/`
        )
    ) {

        return;

    }


    const marker =
        `/storage/v1/object/public/${bucketName}/`;


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
            .from(bucketName)
            .remove([
                filePath
            ]);


    if (error) {

        throw error;

    }

}


/* =========================================================
   27. DELETE MODAL SETUP
   ========================================================= */

function setupDeleteModal() {

    if (
        deleteModalCancel
    ) {

        deleteModalCancel.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    if (
        deleteModalConfirm
    ) {

        deleteModalConfirm.addEventListener(
            "click",
            confirmDelete
        );

    }


    /*
     * Close when clicking the backdrop.
     */

    if (deleteModal) {

        deleteModal.addEventListener(
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

    }


    /*
     * Escape key.
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                deleteModal &&
                !deleteModal.classList.contains(
                    "hidden"
                )
            ) {

                closeDeleteModal();

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


    if (deleteModal) {

        deleteModal.classList.remove(
            "hidden"
        );


        deleteModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    if (
        deleteModalConfirm
    ) {

        deleteModalConfirm.disabled =
            false;

        deleteModalConfirm.focus();

    }

}


/* =========================================================
   29. CLOSE DELETE MODAL
   ========================================================= */

function closeDeleteModal() {

    deletingMemoryId =
        null;


    if (deleteModal) {

        deleteModal.classList.add(
            "hidden"
        );


        deleteModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }

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


    if (deleteModalConfirm) {

        deleteModalConfirm.disabled =
            true;

        deleteModalConfirm.textContent =
            "Deleting...";

    }


    try {

        await deleteMemory(
            id
        );

    } catch (error) {

        console.error(
            "Delete memory error:",
            error
        );

        showToast(
            error?.message ||
            "Unable to delete memory.",
            "error"
        );

        closeDeleteModal();

    } finally {

        if (
            deleteModalConfirm
        ) {

            deleteModalConfirm.disabled =
                false;

            deleteModalConfirm.textContent =
                "Delete Memory";

        }

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
        renderMemories
    );

}


/* =========================================================
   32. CATEGORY FILTER
   ========================================================= */

function setupCategoryFilter() {

    if (!categoryFilter) {

        return;

    }


    categoryFilter.addEventListener(
        "change",
        renderMemories
    );

}


/* =========================================================
   33. SORTING
   ========================================================= */

function setupSorting() {

    if (!sortMemories) {

        return;

    }


    sortMemories.addEventListener(
        "change",
        renderMemories
    );

}


/* =========================================================
   34. LOGOUT
   ========================================================= */

function setupLogout() {

    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


async function handleLogout() {

    if (logoutButton) {

        logoutButton.disabled =
            true;

        logoutButton.textContent =
            "Leaving...";

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

            logoutButton.textContent =
                "Logout";

        }

    }

}


/* =========================================================
   35. ARCHIVE RESULT INFO
   ========================================================= */

function updateArchiveResultInfo(
    count,
    searchTerm
) {

    if (!archiveResultInfo) {

        return;

    }


    const hasSearch =
        Boolean(
            searchTerm
        );


    if (!hasSearch) {

        archiveResultInfo.textContent =
            `${count} ${count === 1 ? "memory" : "memories"}`;

        return;

    }


    if (count === 0) {

        archiveResultInfo.innerHTML =
            `No memories found for <strong>"${escapeHTML(
                searchTerm
            )}"</strong>`;

        return;

    }


    if (count === 1) {

        archiveResultInfo.innerHTML =
            `1 memory found for <strong>"${escapeHTML(
                searchTerm
            )}"</strong>`;

        return;

    }


    archiveResultInfo.innerHTML =
        `${count} memories found for <strong>"${escapeHTML(
            searchTerm
        )}"</strong>`;

}


/* =========================================================
   36. LOADING STATE
   ========================================================= */

function showLoadingState() {

    if (!memoryList) {

        return;

    }


    memoryList.innerHTML = `

        <div class="admin-loading-state">

            <div
                class="admin-loading-heart"
                aria-hidden="true"
            >
                ♡
            </div>

            <div
                class="admin-loading-spinner"
                aria-hidden="true"
            ></div>

            <p>
                Gathering our memories...
            </p>

        </div>

    `;

}


/* =========================================================
   37. EMPTY STATE
   ========================================================= */

function showEmptyState() {

    if (!memoryList) {

        return;

    }


    memoryList.innerHTML = `

        <div class="admin-empty-state">

            <div
                class="admin-empty-icon"
                aria-hidden="true"
            >
                ♡
            </div>

            <h3>
                Nothing here yet.
            </h3>

            <p>
                Some stories are still waiting
                to be written.
            </p>

            <span>
                Try changing your search or filter.
            </span>

        </div>

    `;

}


/* =========================================================
   38. ERROR STATE
   ========================================================= */

function showErrorState(
    message
) {

    if (!memoryList) {

        return;

    }


    memoryList.innerHTML = `

        <div class="admin-error-state">

            <div
                class="admin-error-icon"
                aria-hidden="true"
            >
                ♡
            </div>

            <h3>
                Something went wrong.
            </h3>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <button
                type="button"
                class="admin-retry-button"
                id="retryLoadMemories"
            >
                Try Again
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById(
            "retryLoadMemories"
        );


    retryButton?.addEventListener(
        "click",
        loadMemories
    );

}


/* =========================================================
   39. CATEGORY LABELS
   ========================================================= */

function getCategoryLabel(
    category
) {

    const labels = {

        memory:
            "Memory",

        milestone:
            "Milestone",

        travel:
            "Travel",

        date:
            "Date",

        family:
            "Family",

        celebration:
            "Celebration",

        everyday:
            "Everyday",

        love:
            "Love",

        special:
            "Special"

    };


    return (
        labels[
            String(
                category
            ).toLowerCase()
        ] ||
        capitalize(
            category
        )
    );

}


/* =========================================================
   40. CATEGORY ICONS
   ========================================================= */

function getCategoryIcon(
    category
) {

    const icons = {

        memory:
            "♡",

        milestone:
            "✦",

        travel:
            "✈",

        date:
            "♧",

        family:
            "⌂",

        celebration:
            "✧",

        everyday:
            "☼",

        love:
            "♡",

        special:
            "✦"

    };


    return (
        icons[
            String(
                category
            ).toLowerCase()
        ] ||
        "♡"
    );

}


/* =========================================================
   41. DATE PARSING
   ========================================================= */

function parseDate(
    dateValue
) {

    if (!dateValue) {

        return 0;

    }


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 0;

    }


    return date.getTime();

}


/* =========================================================
   42. DATE FORMATTING
   ========================================================= */

function formatDisplayDate(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

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
   43. FILE EXTENSION
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


    return parts
        .pop()
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        ) || "jpg";

}


/* =========================================================
   44. CAPITALIZE
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
   45. ESCAPE HTML
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
   46. ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   47. TOAST SYSTEM
   ========================================================= */

function showToast(
    message,
    type = "info"
) {

    /*
     * If the new toast container exists,
     * use it.
     */

    if (toastContainer) {

        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `admin-toast admin-toast-${type}`;


        const icon =
            getToastIcon(
                type
            );


        toast.innerHTML = `

            <span
                class="admin-toast-icon"
                aria-hidden="true"
            >
                ${icon}
            </span>

            <span
                class="admin-toast-message"
            >
                ${escapeHTML(
                    message
                )}
            </span>

            <button
                type="button"
                class="admin-toast-close"
                aria-label="Dismiss notification"
            >
                ×
            </button>

        `;


        toastContainer.appendChild(
            toast
        );


        const closeButton =
            toast.querySelector(
                ".admin-toast-close"
            );


        closeButton?.addEventListener(
            "click",
            () => {

                removeToast(
                    toast
                );

            }
        );


        requestAnimationFrame(
            () => {

                toast.classList.add(
                    "show"
                );

            }
        );


        setTimeout(
            () => {

                removeToast(
                    toast
                );

            },
            4200
        );


        return;

    }


    /*
     * Fallback for old HTML.
     */

    console.log(
        `[${type}] ${message}`
    );

}


/* =========================================================
   48. TOAST ICON
   ========================================================= */

function getToastIcon(
    type
) {

    const icons = {

        success:
            "✓",

        error:
            "!",

        info:
            "♡",

        warning:
            "!"

    };


    return (
        icons[type] ||
        icons.info
    );

}


/* =========================================================
   49. REMOVE TOAST
   ========================================================= */

function removeToast(
    toast
) {

    if (!toast) {

        return;

    }


    toast.classList.remove(
        "show"
    );


    setTimeout(
        () => {

            toast.remove();

        },
        250
    );

}


/* =========================================================
   50. GLOBAL AUTH STATE LISTENER
   ========================================================= */

if (
    window.supabaseClient
) {

    window.supabaseClient
        .auth
        .onAuthStateChange(
            (
                event,
                session
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
