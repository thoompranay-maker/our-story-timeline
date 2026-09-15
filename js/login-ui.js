/* =========================================================
   OUR STORY — LOGIN PAGE MICRO-INTERACTIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const stage =
        document.querySelector(".login-stage");

    const storyCard =
        document.querySelector(".story-card");

    const loginCard =
        document.querySelector(".login-card");


    /* =====================================================
       PAGE ENTRANCE
       ===================================================== */

    requestAnimationFrame(() => {

        document.body.classList.add("login-page-ready");

    });


    /* =====================================================
       SUBTLE DESKTOP 3D TILT
       ===================================================== */

    const supportsFinePointer =
        window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        ).matches;


    if (
        stage &&
        storyCard &&
        loginCard &&
        supportsFinePointer
    ) {

        stage.addEventListener("mousemove", (event) => {

            const rect =
                stage.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width;

            const y =
                (event.clientY - rect.top) /
                rect.height;


            const rotateY =
                (x - 0.5) * 2.4;

            const rotateX =
                (0.5 - y) * 1.8;


            storyCard.style.transform =
                `
                translate3d(0, 0, -40px)
                rotateY(${7 + rotateY}deg)
                rotateX(${rotateX}deg)
                rotateZ(-1.2deg)
                `;


            loginCard.style.transform =
                `
                translate3d(0, 0, 20px)
                rotateY(${-3 + rotateY * 0.65}deg)
                rotateX(${rotateX * 0.65}deg)
                rotateZ(0.6deg)
                `;

        });


        stage.addEventListener("mouseleave", () => {

            storyCard.style.transform =
                `
                translate3d(0, 0, -40px)
                rotateY(7deg)
                rotateX(0deg)
                rotateZ(-1.2deg)
                `;


            loginCard.style.transform =
                `
                translate3d(0, 0, 20px)
                rotateY(-3deg)
                rotateX(0deg)
                rotateZ(0.6deg)
                `;

        });

    }

});
