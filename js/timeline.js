/* =========================================================
   OUR STORY — TIMELINE
   Stage 7C
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let allMemories = [];
let currentFilter = "all";
let currentSort = "asc";
let currentSearch = "";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const timelineContainer =
    document.getElementById("timelineContainer");

const emptyState =
    document.getElementById("emptyState");

const sortOrder =
    document.getElementById("sortOrder");

const filterButtons =
    document.querySelectorAll(".filter-button");

const memoryCount =
    document.getElementById("memoryCount");

const memorySearch =
    document.getElementById("memorySearch");

const clearSearch =
    document.getElementById("clearSearch");

const onThisDay =
    document.getElementById("onThisDay");

const onThisDayMemories =
    document.getElementById("onThisDayMemories");

const upcomingSection =
    document.getElementById("upcomingSection");

const upcomingMemories =
    document.getElementById("upcomingMemories");

/* =========================================================
   PHOTO VIEWER ELEMENTS
   ========================================================= */

const photoViewer =
    document.getElementById("photoViewer");

const photoViewerImage =
    document.getElementById("photoViewerImage");

const photoViewerClose =
    document.getElementById("photoViewerClose");

const photoViewerCaption =
    document.getElementById("photoViewerCaption");


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadMemories();

    setupFilters();

    setupSorting();

    setupSearch();

});


/* =========================================================
   LOAD MEMORIES FROM SUPABASE
   ========================================================= */

async function loadMemories() {

    showLoading();

    try {

        const {
            data,
            error
        } = await window.supabaseClient
            .from("memories")
            .select("*")
            .order("event_date", {
                ascending: currentSort === "asc"
            });

        if (error) {
            throw error;
        }

        allMemories = data || [];

        renderTimeline();

        renderOnThisDay();

        renderUpcomingMemories();

    } catch (error) {

        console.error(
            "Error loading memories:",
            error
        );

        timelineContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-heart">♡</div>
                <p>
                    Something went wrong while gathering our memories.
                </p>
            </div>
        `;

    }

}


/* =========================================================
   FILTER SETUP
   ========================================================= */

function setupFilters() {

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.dataset.filter;

            renderTimeline();

        });

    });

}


/* =========================================================
   SORT SETUP
   ========================================================= */

function setupSorting() {

    if (!sortOrder) {
        return;
    }

    sortOrder.addEventListener(
        "change",
        () => {

            currentSort =
                sortOrder.value;

            loadMemories();

        }
    );

}

/* =========================================================
   SEARCH SETUP
   ========================================================= */

function setupSearch() {

    if (!memorySearch) {
        return;
    }

    memorySearch.addEventListener(
        "input",
        () => {

            currentSearch =
                memorySearch.value
                    .trim()
                    .toLowerCase();

            if (clearSearch) {

                clearSearch.classList.toggle(
                    "hidden",
                    currentSearch.length === 0
                );

            }

            renderTimeline();

        }
    );


    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                memorySearch.value = "";

                currentSearch = "";

                clearSearch.classList.add(
                    "hidden"
                );

                memorySearch.focus();

                renderTimeline();

            }
        );

    }

}

/* =========================================================
   FILTER MEMORIES
   ========================================================= */

function getFilteredMemories() {

    let memories = [...allMemories];


    /* -----------------------------
       CATEGORY FILTER
       ----------------------------- */

    if (currentFilter !== "all") {

        memories = memories.filter(
            memory =>
                String(memory.category || "")
                    .toLowerCase() ===
                currentFilter.toLowerCase()
        );

    }


    /* -----------------------------
       SEARCH
       ----------------------------- */

    if (currentSearch) {

        memories = memories.filter(
            memory => {

                const searchableText = [

                    memory.title,

                    memory.description,

                    memory.location,

                    memory.category

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    currentSearch
                );

            }
        );

    }


    return memories;

}

/* =========================================================
   RENDER MAIN TIMELINE
   ========================================================= */

function renderTimeline() {

    const memories =
        getFilteredMemories();

    timelineContainer.innerHTML = "";

    updateMemoryCount(memories.length);

if (!memories.length) {

    emptyState.classList.remove("hidden");

    updateSearchResultInfo(0);

    return;

}

emptyState.classList.add("hidden");

updateSearchResultInfo(
    memories.length
);


    let previousYear = null;


    memories.forEach(
        (memory, index) => {

            const eventDate =
                parseDate(memory.event_date);

            const year =
                eventDate.getFullYear();


            /* -----------------------------
               YEAR CHAPTER
               ----------------------------- */

            if (year !== previousYear) {

                const yearElement =
                    createYearChapter(year);

                timelineContainer.appendChild(
                    yearElement
                );

                previousYear = year;

            }


            /* -----------------------------
               MEMORY CARD
               ----------------------------- */

            const item =
                createMemoryItem(
                    memory,
                    index
                );

            timelineContainer.appendChild(
                item
            );

        }
    );

}

/* =========================================================
   SEARCH RESULT INFO
   ========================================================= */

function updateSearchResultInfo(count) {

    let existing =
        document.getElementById(
            "searchResultInfo"
        );


    if (!currentSearch) {

        if (existing) {
            existing.remove();
        }

        return;

    }


    if (!existing) {

        existing =
            document.createElement("div");

        existing.id =
            "searchResultInfo";

        existing.className =
            "search-result-info";


        const controls =
            document.querySelector(
                ".timeline-controls"
            );


        if (controls) {

            controls.parentNode.insertBefore(
                existing,
                controls
            );

        }

    }


    const safeSearch =
        escapeHTML(currentSearch);


    if (count === 0) {

        existing.innerHTML = `
            No memories found for
            <strong>"${safeSearch}"</strong>
        `;

    } else if (count === 1) {

        existing.innerHTML = `
            1 memory found for
            <strong>"${safeSearch}"</strong>
        `;

    } else {

        existing.innerHTML = `
            ${count} memories found for
            <strong>"${safeSearch}"</strong>
        `;

    }

}


/* =========================================================
   YEAR CHAPTER
   ========================================================= */

function createYearChapter(year) {

    const element =
        document.createElement("div");

    element.className =
        "timeline-year";

    element.innerHTML = `
        <span>${year}</span>
    `;

    return element;

}


/* =========================================================
   CREATE MEMORY ITEM
   ========================================================= */

function createMemoryItem(
    memory,
    index
) {

    const item =
        document.createElement("article");

    item.className =
        "timeline-item";

    item.style.animationDelay =
        `${Math.min(index * 0.05, 0.5)}s`;


    const eventDate =
        parseDate(memory.event_date);

    const isUpcoming =
        isFutureDate(eventDate);


    const formattedDate =
        formatDate(eventDate);


    const category =
        formatCategory(
            memory.category
        );


    const description =
        memory.description
            ? escapeHTML(
                memory.description
            )
            : "";


    const title =
        escapeHTML(
            memory.title || "Untitled Memory"
        );


    const location =
        memory.location
            ? escapeHTML(
                memory.location
            )
            : "";


    /* -----------------------------
       PHOTO
       ----------------------------- */

    let photoHTML = `
        <div class="memory-photo-wrapper">
            <div class="memory-no-photo">
                ♡
            </div>
        </div>
    `;


    if (memory.photo_url) {

        photoHTML = `
            <div class="memory-photo-wrapper">

                ${
                    isUpcoming
                        ? `<span class="upcoming-badge">
                               UPCOMING
                           </span>`
                        : ""
                }

                <img
                    class="memory-photo"
                    src="${escapeAttribute(memory.photo_url)}"
                    alt="${escapeAttribute(memory.title || "Memory")}"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >

            </div>
        `;

    } else if (isUpcoming) {

        photoHTML = `
            <div class="memory-photo-wrapper">

                <span class="upcoming-badge">
                    UPCOMING
                </span>

                <div class="memory-no-photo">
                    ✦
                </div>

            </div>
        `;

    }


    /* -----------------------------
       LOCATION
       ----------------------------- */

    const locationHTML =
        location
            ? `
                <div class="memory-location">
                    <span>⌖</span>
                    ${location}
                </div>
              `
            : "";


    /* -----------------------------
       UPCOMING INFO
       ----------------------------- */

    const upcomingHTML =
        isUpcoming
            ? `
                <div class="upcoming-countdown">
                    ${getUpcomingText(eventDate)}
                </div>
              `
            : "";


    /* -----------------------------
       CARD
       ----------------------------- */

    item.innerHTML = `

        <div class="timeline-dot"></div>

        <div
            class="memory-card ${
                isUpcoming ? "upcoming" : ""
            }"
        >

            ${photoHTML}

            <div class="memory-content">

                <div class="memory-topline">

                    <span class="memory-date">
                        ${formattedDate}
                    </span>

                    <span class="memory-category">
                        ${category}
                    </span>

                </div>


                <h3 class="memory-title">
                    ${title}
                </h3>


                ${
                    description
                        ? `
                            <p class="memory-description">
                                ${description}
                            </p>
                          `
                        : ""
                }


                ${locationHTML}

                ${upcomingHTML}

            </div>

        </div>
    `;


    return item;

}


/* =========================================================
   ON THIS DAY
   ========================================================= */

function renderOnThisDay() {

    if (!onThisDay ||
        !onThisDayMemories) {

        return;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const currentMonth =
        today.getMonth();

    const currentDay =
        today.getDate();


    const matches =
        allMemories.filter(
            memory => {

                const date =
                    parseDate(
                        memory.event_date
                    );

                return (
                    date < today &&
                    date.getMonth() === currentMonth &&
                    date.getDate() === currentDay
                );

            }
        );


    if (!matches.length) {

        onThisDay.classList.add(
            "hidden"
        );

        return;

    }


    onThisDay.classList.remove(
        "hidden"
    );


    onThisDayMemories.innerHTML =
        matches
            .sort(
                (a, b) =>
                    parseDate(a.event_date) -
                    parseDate(b.event_date)
            )
            .map(memory => {

                const date =
                    parseDate(
                        memory.event_date
                    );

                const yearsAgo =
                    today.getFullYear() -
                    date.getFullYear();


                const title =
                    escapeHTML(
                        memory.title ||
                        "Untitled Memory"
                    );


                return `

                    <div class="on-this-day-memory">

                        <div class="on-this-day-date">
                            ${formatDate(date)}
                        </div>

                        <div class="on-this-day-title">
                            ${title}
                        </div>

                        <div class="on-this-day-years">
                            ${
                                yearsAgo === 1
                                    ? "1 year ago"
                                    : `${yearsAgo} years ago`
                            }
                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   UPCOMING MEMORIES
   ========================================================= */

function renderUpcomingMemories() {

    if (!upcomingSection ||
        !upcomingMemories) {

        return;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const upcoming =
        allMemories
            .filter(memory => {

                const date =
                    parseDate(
                        memory.event_date
                    );

                return date > today;

            })
            .sort(
                (a, b) =>
                    parseDate(a.event_date) -
                    parseDate(b.event_date)
            )
            .slice(0, 5);


    if (!upcoming.length) {

        upcomingSection.classList.add(
            "hidden"
        );

        return;

    }


    upcomingSection.classList.remove(
        "hidden"
    );


    upcomingMemories.innerHTML =
        upcoming
            .map(memory => {

                const date =
                    parseDate(
                        memory.event_date
                    );


                const title =
                    escapeHTML(
                        memory.title ||
                        "Untitled Memory"
                    );


                const category =
                    formatCategory(
                        memory.category
                    );


                return `

                    <div class="upcoming-card">

                        <div class="upcoming-card-date">
                            ${formatShortDate(date)}
                        </div>

                        <div class="upcoming-card-info">

                            <h4>
                                ${title}
                            </h4>

                            <p>
                                ${category}
                                ·
                                ${getUpcomingText(date)}
                            </p>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   MEMORY COUNT
   ========================================================= */

function updateMemoryCount(count) {

    if (!memoryCount) {
        return;
    }


    if (count === 0) {

        memoryCount.textContent =
            "No memories";

    } else if (count === 1) {

        memoryCount.textContent =
            "1 memory";

    } else {

        memoryCount.textContent =
            `${count} memories`;

    }

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function parseDate(dateString) {

    if (!dateString) {
        return new Date();
    }


    /*
       Appending T00:00:00 ensures the date
       is interpreted as local midnight rather
       than UTC in browsers.
    */

    return new Date(
        `${dateString}T00:00:00`
    );

}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function formatShortDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FUTURE DATE
   ========================================================= */

function isFutureDate(date) {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return date > today;

}


/* =========================================================
   UPCOMING TEXT
   ========================================================= */

function getUpcomingText(date) {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        date.getTime() -
        today.getTime();


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days === 1) {
        return "Tomorrow";
    }

    if (days < 7) {
        return `In ${days} days`;
    }

    if (days < 30) {

        const weeks =
            Math.round(days / 7);

        return weeks === 1
            ? "In 1 week"
            : `In ${weeks} weeks`;

    }

    if (days < 365) {

        const months =
            Math.round(days / 30);

        return months === 1
            ? "In 1 month"
            : `In ${months} months`;

    }


    const years =
        Math.floor(days / 365);

    return years === 1
        ? "In about 1 year"
        : `In about ${years} years`;

}


/* =========================================================
   CATEGORY FORMAT
   ========================================================= */

function formatCategory(category) {

    if (!category) {
        return "Memory";
    }


    return String(category)
        .trim()
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

}


/* =========================================================
   HTML SECURITY
   ========================================================= */

function escapeHTML(value) {

    return String(value)
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


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showLoading() {

    timelineContainer.innerHTML = `

        <div class="loading-state">

            <div class="loading-heart">
                ♡
            </div>

            <p>
                Gathering our memories...
            </p>

        </div>

    `;

}


/* =========================================================
   END
   ========================================================= */
