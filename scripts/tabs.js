const tabs = document.querySelector("body");
const tabButton = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".content");

tabs.onclick = e => {
    const id = e.target.dataset.id;
    if (id) {
        tabButton.forEach(btn => {
            btn.classList.remove("active");
        });
        // e.target.classList.remove("inactive");

        e.target.classList.add("active");

        contents.forEach(content => {
            content.classList.remove("active");
            // content.classList.remove("active");
        });

        e.target.classList.add("active");
        const element = document.getElementById(id);

        element.classList.add("active");
    }
}