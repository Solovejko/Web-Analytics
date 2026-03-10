const globalUrl = "http://94.19.80.148:3000";
var LPU = "";
var typeStatistic = "lightStatictic";
var dateTimeLight = "today";
var startLight, endLight;
var dateTimeExtended = "today";
var startExtended, endExtended;
var extendedStaticticType = "emdErrors";

startTnitialization();

function startTnitialization(){

    activatingButton("typeData", typeStatistic, "selectedSecond");
    activatingButton("dateTime", dateTimeLight, "selectedSecond");

    openLPUStatistic("main");
}

function activatingButton(classParent, id, nameClass){
    document.querySelectorAll("." + classParent + " button").forEach(function(elem){
        elem.classList.remove(nameClass);    
    });

    document.getElementById(id).classList.add(nameClass);    
}

function openLPUStatistic(id){

    if (id == LPU)
        return;

    LPU = id;

    activatingButton("sideNav", id, "selectedMain");
      
    updateStatisticContent();
    updateErrors();
}

function loadCanvas(data){

    const canvas = document.getElementById("statisticChart");
    const ctx = canvas.getContext("2d");

    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (total <= 0) {
        clearCanvas();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    const innerRadius = 40;

    let startAngle = -Math.PI / 2;

    data.forEach(segment => {
    const sliceAngle = (segment.value / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = segment.color;
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle = endAngle;
    });
}

function updateEmdErrors() {

    document.querySelectorAll(".dataKash tbody tr").forEach(elem => {
        elem.remove();
    })

    let url = `${globalUrl}/kash/emdErrors?start=${encodeURIComponent(startExtended.toISOString())}&end=${encodeURIComponent(endExtended.toISOString())}`;

    fetch(url)
        .then(response => {return response.json()})
        .then(commits => {
            for (let i = 0; i < commits.length; i++){
                
                let table = document.querySelector(".dataKash tbody");
                let lineTable = document.createElement("tr");
                
                let medDocumentType = document.createElement("td");
                let count = document.createElement("td");
                let countErrors = document.createElement("td");
                let s2 = document.createElement("td");
                let s3 = document.createElement("td");
                let s5 = document.createElement("td");

                medDocumentType.textContent = commits[i].medDocumentType;
                
                count.innerHTML = `<span class="badge-all-errors">${commits[i].count}</span>`;
                countErrors.innerHTML = `<span class="${commits[i].countErrors == 0 ? 'badge-zero' : 'badge-errors'}">${commits[i].countErrors}</span>`;
                s2.innerHTML = `<span class="${commits[i].s2 == 0 ? 'badge-zero' : 'badge-s2'}">${commits[i].s2}</span>`;
                s3.innerHTML = `<span class="${commits[i].s3 == 0 ? 'badge-zero' : 'badge-s3'}">${commits[i].s3}</span>`;
                s5.innerHTML = `<span class="${commits[i].s5 == 0 ? 'badge-zero' : 'badge-s5'}">${commits[i].s5}</span>`;

                lineTable.appendChild(medDocumentType);
                lineTable.appendChild(count);
                lineTable.appendChild(countErrors);
                lineTable.appendChild(s2);
                lineTable.appendChild(s3);
                lineTable.appendChild(s5);

                table.appendChild(lineTable);
            }                
        })
        .catch(err => {
            alert('Произошла ошибка при загрузке данных');
            console.error(err);
        });    
}

function updateStatisticErrors(){
    document.querySelectorAll(".dataKashErrors tbody tr").forEach(elem => {
        elem.remove();
    })

    let url = `${globalUrl}/kash/statisticErrors?start=${encodeURIComponent(startExtended.toISOString())}&end=${encodeURIComponent(endExtended.toISOString())}`;

    fetch(url)
        .then(response => {return response.json()})
        .then(commits => {
            for (let i = 0; i < commits.length; i++){
                
                let table = document.querySelector(".dataKashErrors tbody");
                let lineTable = document.createElement("tr");
                
                let error = document.createElement("td");
                let count = document.createElement("td");

                error.textContent = commits[i].message;
                count.innerHTML = `<span class="badge-count">${commits[i].count}</span>`;

                lineTable.appendChild(error);
                lineTable.appendChild(count);

                table.appendChild(lineTable);
            }                
        })
        .catch(err => {
            alert('Произошла ошибка при загрузке данных');
            console.error(err);
        });
}

function clearLightStatistic(){
    clearCanvas();
    clearLegend();    
}

function clearLegend(){
    let s0 = document.querySelector(".s0 .row");
    s0.style.setProperty("--p", 0);
    s0.querySelector(".bar").textContent = "0 (0%)";

    let s1 = document.querySelector(".s1 .row");
    s1.style.setProperty("--p", 0);
    s1.querySelector(".bar").textContent = "0 (0%)";

    let s2 = document.querySelector(".s2 .row");
    s2.style.setProperty("--p", 0);
    s2.querySelector(".bar").textContent = "0 (0%)";

    let s3 = document.querySelector(".s3 .row");
    s3.style.setProperty("--p", 0);
    s3.querySelector(".bar").textContent = "0 (0%)";

    let s4 = document.querySelector(".s4 .row");
    s4.style.setProperty("--p", 0);
    s4.querySelector(".bar").textContent = "0 (0%)";

    let s5 = document.querySelector(".s5 .row");
    s5.style.setProperty("--p", 0);
    s5.querySelector(".bar").textContent = "0 (0%)";
}

function clearCanvas(){
    const canvas = document.getElementById("statisticChart");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    const innerRadius = 40;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
    ctx.closePath();

    ctx.fillStyle = "#cccccc";
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function updateLightStatisticContent(){

    let url = `${globalUrl}/kash/lightStatistic?start=${encodeURIComponent(startLight.toISOString())}&end=${encodeURIComponent(endLight.toISOString())}`;

    fetch(url)
        .then(response => {return response.json()})
        .then(commits => {
   
            if (commits.length == 1){
                var data = [
                    { value: commits[0].s0 / commits[0].count * 100, color: "#969696" },
                    { value: commits[0].s1 / commits[0].count * 100, color: "#00ABD3" },
                    { value: commits[0].s2 / commits[0].count * 100, color: "#F47521" },
                    { value: commits[0].s3 / commits[0].count * 100, color: "#338AA9" },
                    { value: commits[0].s4 / commits[0].count * 100, color: "#00A78E" },
                    { value: commits[0].s5 / commits[0].count * 100, color: "#976A65" }
                ];
            } else {
                clearLightStatistic();
                return;
            }

            let s0 = document.querySelector(".s0 .row");
            s0.style.setProperty("--p", data[0].value);
            s0.querySelector(".bar").textContent = commits[0].s0 + " (" + (data[0].value.toFixed(2) < 1? "<1": data[0].value.toFixed(2)) + "%)";

            let s1 = document.querySelector(".s1 .row");
            s1.style.setProperty("--p", data[1].value);
            s1.querySelector(".bar").textContent = commits[0].s1 + " (" + (data[1].value.toFixed(2) < 1? "<1": data[1].value.toFixed(2)) + "%)";

            let s2 = document.querySelector(".s2 .row");
            s2.style.setProperty("--p", data[2].value);
            s2.querySelector(".bar").textContent = commits[0].s2 + " (" + (data[2].value.toFixed(2) < 1? "<1": data[2].value.toFixed(2)) + "%)";

            let s3 = document.querySelector(".s3 .row");
            s3.style.setProperty("--p", data[3].value);
            s3.querySelector(".bar").textContent = commits[0].s3 + " (" + (data[3].value.toFixed(2) < 1? "<1": data[3].value.toFixed(2)) + "%)";

            let s4 = document.querySelector(".s4 .row");
            s4.style.setProperty("--p", data[4].value);
            s4.querySelector(".bar").textContent = commits[0].s4 + " (" + (data[4].value.toFixed(2) < 1? "<1": data[4].value.toFixed(2)) + "%)";

            let s5 = document.querySelector(".s5 .row");
            s5.style.setProperty("--p", data[5].value);
            s5.querySelector(".bar").textContent = commits[0].s5 + " (" + (data[5].value.toFixed(2) < 1? "<1": data[5].value.toFixed(2)) + "%)";

            loadCanvas(data);             
        })
        .catch(err => {
            alert('Произошла ошибка при загрузке данных');
            console.error(err);
        }); 
}

function subtractMonthSafe(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = d.getMonth() - 1;
    const day = d.getDate();

    const lastDay = new Date(year, month + 1, 0).getDate();

    const safeDay = Math.min(day, lastDay);

    return new Date(year, month, safeDay, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}

function updateStatisticContent(id = ""){

    if (id != ""){
        if (typeStatistic == "lightStatictic"){
            dateTimeLight = id;
            activatingButton("dateTime", dateTimeLight, "selectedSecond");

            if (id !== "anotherDate") {
                const dateRange = updateDate(dateTimeLight);
                startLight = dateRange[0];
                endLight = dateRange[1];
            }
        } else {
            dateTimeExtended = id;
            activatingButton("dateTime", dateTimeExtended, "selectedSecond");

            if (id !== "anotherDate") {
                const dateRange = updateDate(dateTimeExtended);
                startExtended = dateRange[0];
                endExtended = dateRange[1];
            }
        }
    } else {
        if (dateTimeLight !== "anotherDate"){
            const dateRange = updateDate(dateTimeLight);
            startLight = dateRange[0];
            endLight = dateRange[1];
        }

        if (dateTimeExtended !== "anotherDate"){
            const dateRange = updateDate(dateTimeExtended);
            startExtended = dateRange[0];
            endExtended = dateRange[1];
        }
    }

    if (typeStatistic == "lightStatictic")
        updateLightStatisticContent(); 
    else
        updateErrors();
}

function updateDate(dateTime){
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (dateTime == "today"){
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
    }

    if (dateTime == "yesterday"){
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);

        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
    }

    if (dateTime == "week"){
        start.setDate(start.getDate() - 7);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
    }

    if (dateTime == "month"){
        start = subtractMonthSafe(now);
        start.setHours(0,0,0,0);

        end.setHours(23,59,59,999);
    }

    return [start, end];
}

function openLightStatistic(){
    document.querySelector(".lightStaticticContent").style.display = "grid";
    document.querySelector(".extendedStaticticContent").style.display = "none";

    typeStatistic = "lightStatictic";
    activatingButton("typeData", typeStatistic, "selectedSecond");
    activatingButton("dateTime", dateTimeLight, "selectedSecond");
    closeCustomDatePanel();
}

function openExtendedStatictic(){
    document.querySelector(".lightStaticticContent").style.display = "none";
    document.querySelector(".extendedStaticticContent").style.display = "grid";

    typeStatistic = "extendedStatictic";
    activatingButton("typeData", typeStatistic, "selectedSecond");
    activatingButton("dateTime", dateTimeExtended, "selectedSecond");
    closeCustomDatePanel();

    activatingButton("extendedStaticticType", extendedStaticticType, "selectedSecond");
}

function updateErrors(id = ""){

    if (id != ""){
        extendedStaticticType = id;
        activatingButton("extendedStaticticType", extendedStaticticType, "selectedSecond");
    } 

    if (extendedStaticticType == "emdErrors"){
        document.querySelector(".emdErrorsContent").style.display = "grid";
        document.querySelector(".statisticErrorsContent").style.display = "none";
        updateEmdErrors();
    }
 
    if (extendedStaticticType == "statisticErrors"){    
        document.querySelector(".emdErrorsContent").style.display = "none";
        document.querySelector(".statisticErrorsContent").style.display = "grid";
        updateStatisticErrors();     
    }
}

function openCustomDatePanel() {
    const panel = document.querySelector(".customDatePanel");
    panel.style.display = "grid";
    positionCustomDatePanel();
}

function closeCustomDatePanel() {
    document.querySelector(".customDatePanel").style.display = "none";
}

function normalizeDateRange(startValue, endValue) {
    const start = new Date(startValue);
    const end = new Date(endValue);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return [start, end];
}

function applyCustomDateRange(options = {}) {
    const { requireFilled = false, showAlert = true } = options;

    const startValue = document.getElementById("customDateStart").value;
    const endValue = document.getElementById("customDateEnd").value;

    if (!startValue || !endValue) {
        if (requireFilled && showAlert) {
            alert("Выберите начальную и конечную дату");
        }
        return false;
    }

    if (startValue > endValue) {
        if (showAlert) {
            alert("Дата начала не может быть больше даты окончания");
        }
        return false;
    }

    const range = normalizeDateRange(startValue, endValue);

    if (typeStatistic === "lightStatictic") {
        dateTimeLight = "anotherDate";
        startLight = range[0];
        endLight = range[1];
    } else {
        dateTimeExtended = "anotherDate";
        startExtended = range[0];
        endExtended = range[1];
    }

    activatingButton("dateTime", "anotherDate", "selectedSecond");
    updateStatisticContent();

    return true;
}

function positionCustomDatePanel() {
    const panel = document.querySelector(".customDatePanel");
    const button = document.getElementById("anotherDate");
    const main = document.querySelector("main");

    const buttonRect = button.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();

    const top = buttonRect.bottom - mainRect.top + 8;
    let left = buttonRect.left - mainRect.left;

    const maxLeft = main.clientWidth - panel.offsetWidth - 10;
    if (left > maxLeft) {
        left = Math.max(10, maxLeft);
    }

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
}

function isCustomDatePanelOpen() {
    return document.querySelector(".customDatePanel").style.display === "grid";
}

document.getElementById("lightStatictic")
    .addEventListener("click", function(event) {
        event.preventDefault();
        openLightStatistic();
    });

document.getElementById("extendedStatictic")
    .addEventListener("click", function(event) {
        event.preventDefault();
        openExtendedStatictic();
    });

document.querySelectorAll(".extendedStaticticType .subButton").forEach(function(elem){
     elem.addEventListener("click", function(event) {
        event.preventDefault();
        updateErrors(event.target.getAttribute("id"));
    });
});

document.querySelectorAll(".dateTime .subButton").forEach(function(elem){
    elem.addEventListener("click", function(event) {
        event.preventDefault();

        const id = event.target.getAttribute("id");

        if (id === "anotherDate") {
            if (isCustomDatePanelOpen()) {
                if (applyCustomDateRange({ requireFilled: true, showAlert: true })) {
                    closeCustomDatePanel();
                }
                return;
            }

            if (typeStatistic == "lightStatictic") {
                dateTimeLight = "anotherDate";
            } else {
                dateTimeExtended = "anotherDate";
            }

            activatingButton("dateTime", "anotherDate", "selectedSecond");
            openCustomDatePanel();
            return;
        }

        closeCustomDatePanel();
        updateStatisticContent(id);
    });
});

document.getElementById("applyCustomDate")
    .addEventListener("click", function(event) {
        event.preventDefault();

        if (applyCustomDateRange({ requireFilled: true, showAlert: true })) {
            closeCustomDatePanel();
        }
    });

document.getElementById("cancelCustomDate")
    .addEventListener("click", function(event) {
        event.preventDefault();
        closeCustomDatePanel();
    });

document.querySelectorAll(".sideNav .sideNavButton").forEach(function(elem){
     elem.addEventListener("click", function(event) {
        event.preventDefault();
        openLPUStatistic(event.target.getAttribute("id"));
    });
});

window.addEventListener("resize", function() {
    const panel = document.querySelector(".customDatePanel");
    if (panel.style.display !== "none") {
        positionCustomDatePanel();
    }
});

document.addEventListener("click", function(event) {
    const panel = document.querySelector(".customDatePanel");
    const anotherDateButton = document.getElementById("anotherDate");

    if (!isCustomDatePanelOpen()) {
        return;
    }

    const clickInsidePanel = panel.contains(event.target);
    const clickOnAnotherDateButton = anotherDateButton.contains(event.target);

    if (!clickInsidePanel && !clickOnAnotherDateButton) {
        if (applyCustomDateRange({ requireFilled: true, showAlert: false })) {
            closeCustomDatePanel();
        }
    }
});