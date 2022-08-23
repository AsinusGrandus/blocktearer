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






fetch("/api/blocklist").then((response) => response.json()).then((data) => {
    Object.keys(woolData).forEach((wooltype) => {
        // Create a new tab <li> that looks like: <li class='tab active ' data-tab-target="#white">white</li>
        const tab = document.createElement('li');
    
        if (wooltype == 'white') { 
            tab.classList.add('active'); 
        }
    
        // Give the tab <li> properties
        tab.innerHTML = wooltype;
        tab.id = "#" + wooltype;
        tab.classList.add('tab');
        tab.dataset.tabTarget = "#" + wooltype;
        tab.style.color = woolData[wooltype]['colour'];
        tab.dataset.tabColour = woolData[wooltype]['colour'];
    
        // Add tab <li> to tabnav <ul>
        tabnav.appendChild(tab);
        // Add colour <div> to tabcontent <div>
        tabcontent.appendChild(blockResultsHolder(data, wooltype))
    })

    // Get all tabs with the tabTarget property
    const tabs = document.querySelectorAll('[data-tab-target]');
    // Tab logic
    tabs.forEach((tab) => {
        // Add an event listener to the tab <li>
        tab.addEventListener('click', () => {
            // Get all tab contents with the tabContent property
            const tabContents = document.querySelectorAll('[data-tab-content]');
            
            // tab.dataset.tabTarget is the id from the tab content <div>
            const target = document.querySelector(tab.dataset.tabTarget)
            // console.log(target) Give 'results' <div> the unique colour id and make all content childeren
            // Remove active class from all tabContents <div> and tabs <li>
            tabContents.forEach((content) => {
                content.classList.remove('active')
            })
            tabs.forEach((tab) => {
                tab.classList.remove('active')
                // Remove background color and set color
                tab.style.backgroundColor = '';
                tab.style.color = tab.dataset.tabColour;
            })

            // Make tab active
            tab.classList.add('active');
            target.classList.add('active');

            // Make the text black and set the backgroundcolor
            tab.style.color = 'black';
            tab.style.backgroundColor = tab.dataset.tabColour;
        })
    })
})


// Get blocks that match requirements
function getBlocks(data, mode, bits) {
    // mode: first/last (bits that need to match)
    // bits: number (where to split the 13 bits)
    // Get sumbitted block
    const submittedBlockDiv = document.getElementById('submittedBlockDataDiv');
    const submittedBlock = JSON.parse(submittedBlockDiv.dataset.submittedblock);

    let validBlocks = new Array();

    Object.keys(data).forEach((element) => {
        const block = data[element];
        if (block.name == submittedBlock.name.toString() || block.name == "null") { return }
        
        if (mode == 'first') {
            if (block.bits.substring(0, bits) === submittedBlock.bits.substring(0, bits)) {
                // First bits from the block match
                validBlocks.push(block)
            } else { return }
        } else if (mode == 'last') {
            if (block.bits.substring(bits) === submittedBlock.bits.substring(bits)) {
                // Last bits from the block match
                validBlocks.push(block)
            } else { return }
        } else { return }  
    })

    console.log('Block matches for ' + mode + ' ' + bits + ':' + validBlocks.length)
    return validBlocks

}

function addInfoHeader(wooltype) {
    // Create info <div> that will display extra information above the grid
    const info = document.createElement('div');

    // Give the location <p> properties and add to colour <div>
    const location = document.createElement('p');
    location.innerHTML = `The wordtearing needs to take place in the location from the ${wooltype} wool block`

    // Append childeren to the info <div>
    info.appendChild(location);

    return info
}

function addColumnHolder(data, wooltype) {
    // Create new comulnHolder <div> that holds all result columns
    const columnHolder = document.createElement('div');
    columnHolder.classList.add('column_holder');

    const columns = ['first', 'last'];
    columns.forEach((name) => {
        columnHolder.appendChild(addColumn(data, wooltype, name));
    })
    return columnHolder
}

function addColumn(data, wooltype, name) {
    // Create new column <div>
    const blockColumn = document.createElement('div');
    // blockColumn.id = id;
    blockColumn.classList.add('block_column');


    
    // Add explanation <p> to blockColumn <div>
    blockColumn.appendChild(addExplanation(name));
    blockColumn.appendChild(addGrid(data, wooltype, name))
    
    return blockColumn
}

function addGrid(data, wooltype, mode){
    // Create new grid <div> that will hold all blocks
    const grid = document.createElement('div');
    grid.id = mode + '_grid';
    grid.classList.add('grid')

    // Create all block elements
    let Used = new Array();
    // Get valid blocks
    const blocks = getBlocks(data, mode, woolData[wooltype]['bits']);

    blocks.forEach((block) => {
        if (Used.includes(block.name)) {
            // the block is already used
            // A <p> and <img> are combined into a <div> that has an array with details and the block it belongs to as dataset
            const detailsDiv = document.getElementById(block.name);

            if (detailsDiv == undefined || detailsDiv == null) { 
                console.log('is nudefined')
            } else {
                const blockArray = JSON.parse(detailsDiv.dataset.details);
                blockArray.push(block);
                detailsDiv.dataset.details = JSON.stringify(blockArray);
            }

        } else {
            grid.appendChild(addBlock(block))
            Used.push(block.name)
        }
    })

    return grid
}

function addBlock(block) {
    // Create <div> element that will contain <p> and <img> 
    const blockdiv = document.createElement('div');
    blockdiv.id = block.name;
    blockdiv.classList.add('block')
    blockdiv.addEventListener("click", function(){ 
        console.log('clicked ' + block.name)
        popUp(block.name); 
    });
    blockdiv.dataset.details = JSON.stringify([block]);
    blockdiv.dataset.block = JSON.stringify([block]);


    // Create <img> element
    const img = document.createElement('img');
    img.src = block.img
    img.setAttribute("height", "50");
    img.setAttribute("width", "50");
    img.addEventListener("error", function(){ 
        this.onerror=null;
        this.src='https://minecraft-api.vercel.app/images/blocks/air.png'
    });
    
    // Create <p> element
    const blockP = document.createElement('p');
    const text = document.createTextNode(block.oldName);
    blockP.appendChild(text); // add text to <p>

    blockdiv.appendChild(img)
    blockdiv.appendChild(blockP); // add to <div>

    return blockdiv
}

function addExplanation(name) {
    // Create new p <p> to explain the column
    const explanation = document.createElement('p');
    explanation.innerHTML = `${name} block options:`;

    return explanation
}

function blockResultsHolder(data, wooltype) {
    // Create new results <div> that holds all result data
    const results = document.createElement('div');
    // Give the result <div> properties
    results.id = wooltype;
    results.dataset.tabContent = '';

    if (wooltype == 'white') { 
        results.classList.add('active'); 
    }
    // Add info header <div> to result <div>
    results.appendChild(addInfoHeader(wooltype));
    results.appendChild(addColumnHolder(data, wooltype));
   
    return results
}


// // Create two columns with blocks
// columnIds.forEach((id) => {
//     const blockColumn = document.querySelector(id); // get column x
//     const blocks = JSON.parse(blockColumn.dataset.blocks); // get block data x

//     let Used = new Array();

//     blocks.forEach((element) => {
//         if (Used.includes(element.name)) {
//             // the block is already used
//             // A <p> and <img> are combined into a <div> that has an array with details and the block it belongs to as dataset
//             const detailsDiv = document.getElementById(element.name);

//             if (detailsDiv == "undefined") {return}

//             const blockArray = JSON.parse(detailsDiv.dataset.details);
//             blockArray.push(element);
//             detailsDiv.dataset.details = JSON.stringify(blockArray);

//             return
//         }

//         // Create <div> element that will contain <p> and <img> 
//         const div = document.createElement('div');
//         div.id = element.name;
//         div.classList.add('block')
//         div.addEventListener("click", function(){ popUp(element.name); });
//         div.dataset.details = JSON.stringify([element]);
//         div.dataset.block = JSON.stringify([element]);
//         // append to column
//         blockColumn.appendChild(div);

//         // Create <img> element
//         const img = document.createElement('img');
//         img.src = element.img
//         img.setAttribute("height", "50");
//         img.setAttribute("width", "50");
//         img.addEventListener("error", function(){ 
//             this.onerror=null;
//             this.src='https://minecraft-api.vercel.app/images/blocks/air.png'
//             });
//         div.appendChild(img)

//         // Create <p> element
//         const blockP = document.createElement('p');
//         const text = document.createTextNode(element.oldName);
//         blockP.appendChild(text); // add text to <p>
//         div.appendChild(blockP); // add to <div>
                    
//         // mark element as used
//         Used.push(element.name)
//     })

// })

// Popups
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
    bitsDiv.innerHTML = 'Bits: ' + block.bits;

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