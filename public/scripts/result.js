// The colours from the wool combined with the number of bits that get cut of at that location
const woolData = {
    "white": {'bits': 0, 'colour': '#f2f5f3'},
    "orange": {'bits': 1, 'colour': '#ffcc75'},
    "magenta": {'bits': 2, 'colour': '#ff75fa'},
    "light-blue": {'bits': 3, 'colour': '#75fffd'},
    "yelllow": {'bits': 4, 'colour': '#fffd75'},
    "lime": {'bits': 5, 'colour': '#75ff7a'},
    "pink": {'bits': 6, 'colour': '#ff75a8'},
    "gray": {'bits': 7, 'colour': '#757575'},
    "light-gray": {'bits': 8, 'colour': '#a19f9f'},
    "cyan": {'bits': 9, 'colour': '#75ffc8'},
    "purple": {'bits': 10, 'colour': '#df75ff'},
    "blue": {'bits': 11, 'colour': '#7577ff'},
    "brown": {'bits': 12, 'colour': '#918474'},
};

// Get the tabnav <ul>
const tabnav = document.getElementById('tabnav');
// Get the tabcontent <div>
const tabcontent = document.getElementById('tabcontent');

Object.keys(woolData).forEach((wooltype) => {
    // Create a new tab <li> that looks like: <li class='tab active ' data-tab-target="#white">white</li>
    const tab = document.createElement('li');

    // Create a new colour <div> that looks like: <div id="orange" data-tab-content></div>
    const colour = document.createElement('div');
    const p = document.createElement('p');

    if (wooltype == 'white') { 
        tab.classList.add('active'); 
        colour.classList.add('active');
    }

    // Give the tab <li> properties
    tab.innerHTML = wooltype;
    tab.id = "#" + wooltype;
    tab.classList.add('tab');
    tab.dataset.tabTarget = "#" + wooltype;
    tab.style.color = woolData[wooltype]['colour'];
    tab.dataset.tabColour = woolData[wooltype]['colour'];

    // Give the colour <div> properties
    colour.id = wooltype;
    colour.dataset.tabContent = '';

    // Give the p <p> properties and add to colour <div>
    p.innerHTML = `The wordtearing needs to take place in the location from the ${wooltype} wool block`;
    colour.appendChild(p)

    // Add tab <li> to tabnav <ul>
    tabnav.appendChild(tab);
    // Add colour <div> to tabcontent <div>
    tabcontent.appendChild(colour);
})

// Get all tabs with the tabTarget property
const tabs = document.querySelectorAll('[data-tab-target]');
// Get all tab contents with the tabContent property
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach((tab) => {
    // Add an event listener to the tab <li>
    tab.addEventListener('click', () => {
        // tab.dataset.tabTarget is the id from the tab content <div>
        const target = document.querySelector(tab.dataset.tabTarget)

        // Remove active class from all tabContents <div> and tabs <li>
        tabContents.forEach((content) => {
            content.classList.remove('active')
        })
        tabs.forEach((tab) => {
            tab.classList.remove('active')
            // Remove background color and set color
            tab.style.color = tab.dataset.tabColour
            tab.style.backgroundColor = '';
        })

        // Make tab active
        tab.classList.add('active');
        target.classList.add('active');

        // Make the text black and set the backgroundcolor
        tab.style.color = 'black';
        tab.style.backgroundColor = tab.dataset.tabColour;
    })
})



// Other stuff
const columnIds = ['#first_blocks_column_grid', '#last_blocks_column_grid']

// Create two columns with blocks
columnIds.forEach((id) => {
    const blockColumn = document.querySelector(id); // get column
    const blocks = JSON.parse(blockColumn.dataset.blocks); // get block data

    let Used = new Array();

    blocks.forEach((element) => {
        if (Used.includes(element.name)) {
            // the block is already used
            // A <p> and <img> are combined into a <div> that has an array with details and the block it belongs to as dataset
            const detailsDiv = document.getElementById(element.name);

            if (detailsDiv == "undefined") {return}

            const blockArray = JSON.parse(detailsDiv.dataset.details);
            blockArray.push(element);
            detailsDiv.dataset.details = JSON.stringify(blockArray);

            return
        }

        // Create <div> element that will contain <p> and <img> 
        const div = document.createElement('div');
        div.id = element.name;
        div.classList.add('block')
        div.addEventListener("click", function(){ popUp(element.name); });
        div.dataset.details = JSON.stringify([element]);
        div.dataset.block = JSON.stringify([element]);
        // append to column
        blockColumn.appendChild(div);

        // Create <img> element
        const img = document.createElement('img');
        img.src = element.img
        img.setAttribute("height", "50");
        img.setAttribute("width", "50");
        img.addEventListener("error", function(){ 
            this.onerror=null;
            this.src='https://minecraft-api.vercel.app/images/blocks/air.png'
            });
        div.appendChild(img)

        // Create <p> element
        const blockP = document.createElement('p');
        const text = document.createTextNode(element.oldName);
        blockP.appendChild(text); // add text to <p>
        div.appendChild(blockP); // add to <div>
                    
        // mark element as used
        Used.push(element.name)
    })

})

function toggleModal() {
    const modal = document.querySelector(".modal");
    modal.classList.toggle("show-modal");
}

function popUp(id) {
    const closeButton = document.querySelector(".close-button");
    closeButton.addEventListener("click", toggleModal);

    const dataDiv = document.getElementById(id);
    const details = JSON.parse(dataDiv.dataset.details); // [{},{}]
    const block = JSON.parse(dataDiv.dataset.block)[0];

    // const imgImg = document.getElementById("blockimg");
    // imgImg.src = block.img;

    const nameH = document.getElementById('blockname');
    nameH.innerHTML = 'Name: ' + block.name;

    const bitsDiv = document.getElementById('bits');
    bitsDiv.innerHTML = 'Bits: ' + block.firstFourBits + ' ' + block.lastNineBits;

    const detailDiv = document.getElementById('details');
    let detailDivText = "Details:<br>";
    

    details.forEach((block) => {
        let detailText = new String();
        block.details.forEach((detail) => {
            detailText += detail + ", ";
        })
        detailDivText += block.id + ': ' + detailText.slice(0, -2) + "<br>";
    })
    // Make this prettier
    detailDiv.innerHTML = detailDivText;

    toggleModal()
}