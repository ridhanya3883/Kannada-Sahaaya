
// TRANSLATION FUNCTION

async function translateText(text) {
    let result = document.getElementById("kannadaResult");

    if (text.trim() === "") {
        alert("Please enter a phrase!");
        return;
    }

    result.innerHTML = "Translating...";

    try {
        let response = await fetch("/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        let data = await response.json();

        if (!response.ok) {
            throw new Error("Translation failed");
        }

        result.innerHTML = "";

        let translation = document.createElement("p");
        translation.innerText = data.translation;
        result.appendChild(translation);

        // KANNADA PRONUNCIATION BUTTON

        let speakButton = document.createElement("button");
        speakButton.innerText = "🔊 Listen to Kannada pronunciation";

        speakButton.addEventListener("click", async function () {
            speakButton.disabled = true;
            speakButton.innerText = "Generating audio...";

            try {
                let response = await fetch("/speak", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: data.translation
                    })
                });

                let audioData = await response.json();

                if (!response.ok) {
                    throw new Error("Audio generation failed");
                }

                let audio = new Audio(
                    "data:audio/wav;base64," + audioData.audio
                );

                await audio.play();

            } catch (error) {
                alert("Unable to generate Kannada pronunciation. Please try again.");
            } finally {
                speakButton.disabled = false;
                speakButton.innerText = "🔊 Listen to Kannada pronunciation";
            }
        });

        result.appendChild(speakButton);

    } catch (error) {
        result.innerText = "Unable to translate. Please try again.";
    }
}


// TRANSLATE BUTTON

document.getElementById("translateBtn").addEventListener("click", function () {
    let text = document.getElementById("englishText").value.trim();
    translateText(text);
});


// PRESS ENTER TO TRANSLATE

document.getElementById("englishText").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        translateText(this.value.trim());
    }
});


// EVERYDAY PHRASE BUTTONS

document.querySelectorAll(".phrase").forEach(function (button) {
    button.addEventListener("click", function () {
        let phrase = button.getAttribute("data-text");

        document.getElementById("englishText").value = phrase;
        translateText(phrase);

        document.getElementById("translator").scrollIntoView({
            behavior: "smooth"
        });
    });
});


// SEARCH PHRASES

document.getElementById("searchPhrase").addEventListener("input", function () {
    let searchText = this.value.toLowerCase().trim();
    let categories = document.querySelectorAll(".category-card");
    let totalVisible = 0;

    categories.forEach(function (category) {
        let categoryButtons = category.querySelectorAll(".phrase");
        let visibleCount = 0;

        categoryButtons.forEach(function (button) {
            let phrase = button.innerText.toLowerCase();

            if (phrase.includes(searchText)) {
                button.style.display = "inline-block";
                visibleCount++;
                totalVisible++;
            } else {
                button.style.display = "none";
            }
        });

        category.style.display = visibleCount > 0 ? "block" : "none";
    });

    document.getElementById("noResults").style.display =
        totalVisible === 0 ? "block" : "none";
});
