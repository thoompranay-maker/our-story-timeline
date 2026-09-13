
let memories = [];

let currentFilter = "all";


// ======================================================
// LOAD MEMORIES
// ======================================================

async function loadTimeline() {

    const container =
        document.getElementById("timelineContainer");

    const emptyState =
        document.getElementById("emptyState");

    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-heart">♡</div>
            <p>Gathering our memories...</p>
        </div>
    `;


    const ascending =
        document.getElementById("sortOrder").value === "asc";


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

        console.error(
            "Timeline loading error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                <div>♡</div>

                <h3>
                    Something went wrong.
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;

        return;
    }


    memories = data || [];

    renderTimeline();

}


// ======================================================
// RENDER TIMELINE
// ======================================================

function renderTimeline() {

    const container =
        document.getElementById("timelineContainer");

    const emptyState =
        document.getElementById("emptyState");


    let filteredMemories;


    if (currentFilter === "all") {

        filteredMemories = memories;

    } else {

        filteredMemories =
            memories.filter(
                memory =>
                    memory.category === currentFilter
            );

    }


    if (filteredMemories.length === 0) {

        container.innerHTML = "";

        emptyState.classList.remove("hidden");

        return;

    }


    emptyState.classList.add("hidden");


    container.innerHTML = "";


    filteredMemories.forEach(
        (memory, index) => {

            const item =
                createTimelineItem(
                    memory,
                    index
                );

            container.appendChild(item);

        }
    );

}


// ======================================================
// CREATE TIMELINE ITEM
// ======================================================

function createTimelineItem(memory, index) {

    const item =
        document.createElement("article");


    item.className =
        "timeline-item";


    item.style.animationDelay =
        `${index * 0.08}s`;


    const isLeft =
        index % 2 === 0;


    const card =
        createMemoryCard(memory);


    const leftSide =
        document.createElement("div");

    leftSide.className =
        "timeline-side left";


    const rightSide =
        document.createElement("div");

    rightSide.className =
        "timeline-side right";


    const marker =
        document.createElement("div");

    marker.className =
        "timeline-marker";

    marker.innerHTML =
        getCategoryIcon(memory.category);


    if (isLeft) {

        leftSide.appendChild(card);

    } else {

        rightSide.appendChild(card);

    }


    item.appendChild(leftSide);

    item.appendChild(marker);

    item.appendChild(rightSide);


    return item;

}


// ======================================================
// MEMORY CARD
// ======================================================

function createMemoryCard(memory) {

    const card =
        document.createElement("div");


    card.className =
        "memory-card";


    const date =
        formatDate(memory.event_date);


    const icon =
        getCategoryIcon(memory.category);


    let photoHTML = "";


    if (memory.photo_url) {

        photoHTML = `
            <div class="memory-photo">

                <img
                    src="${escapeAttribute(memory.photo_url)}"
                    alt="${escapeAttribute(memory.title)}"
                    loading="lazy"
                >

            </div>
        `;

    }


    card.innerHTML = `

        ${photoHTML}

        <div class="memory-date">
            ${date}
        </div>

        <h3 class="memory-title">
            ${escapeHTML(memory.title)}
        </h3>

        ${
            memory.description
            ?
            `
            <p class="memory-description">
                ${escapeHTML(memory.description)}
            </p>
            `
            :
            ""
        }

        <div class="memory-meta">

            ${
                memory.category
                ?
                `
                <span class="memory-tag">
                    ${icon}
                    ${formatCategory(memory.category)}
                </span>
                `
                :
                ""
            }

            ${
                memory.location
                ?
                `
                <span class="memory-tag">
                    📍
                    ${escapeHTML(memory.location)}
                </span>
                `
                :
                ""
            }

        </div>

    `;


    return card;

}


// ======================================================
// DATE FORMAT
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


// ======================================================
// CATEGORY ICON
// ======================================================

function getCategoryIcon(category) {

    const icons = {

        memory: "♡",

        milestone: "💍",

        date: "🌹",

        travel: "✈️",

        celebration: "🎉",

        funny: "😂",

        family: "🏡"

    };


    return icons[category] || "♡";

}


// ======================================================
// CATEGORY NAME
// ======================================================

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


// ======================================================
// FILTERS
// ======================================================

document
    .querySelectorAll(".filter-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-button")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                renderTimeline();

            }
        );

    });


// ======================================================
// SORTING
// ======================================================

document
    .getElementById("sortOrder")
    .addEventListener(
        "change",
        loadTimeline
    );


// ======================================================
// SECURITY HELPERS
// ======================================================

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

loadTimeline();
