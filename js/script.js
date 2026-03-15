const globalUrl = "http://solovejko.sknt.ru:3000";
var LPU = "";
var idLpu = "";
var typeStatistic = "lightStatictic";
var dateTimeLight = "today";
var startLight, endLight;
var dateTimeExtended = "today";
var startExtended, endExtended;
var extendedStaticticType = "emdErrors";
let notificationTimer = null;
let selectedMedDocumentType = "";
let selectedErrorMessage = "";

let detailMedDocumentType = "";
let detailStatusFilter = "";
let detailColumnType = "";
let detailErrorMessage = "";
let detailSourceType = "";

let detailPageSize = 100;
let detailOffset = 0;
let detailTotal = 0;

let lightStatisticController = null;
let emdErrorsController = null;
let statisticErrorsController = null;
let emdErrorDetailsController = null;

let listLpuId = {
    main:     "",
    kash:     "1.2.643.5.1.13.13.12.2.78.8575",
    chud:     "1.2.643.5.1.13.13.12.2.78.8580",
    plk114:   "1.2.643.5.1.13.13.12.2.78.8631",
    gpb:      "1.2.643.5.1.13.13.12.2.78.8578",
    plk81:    "1.2.643.5.1.13.13.12.2.78.8781",
    kdp:      "1.2.643.5.1.13.13.12.2.78.8750",
    pndr:     "1.2.643.5.1.13.13.12.2.78.8690",
    stepmed:  "1.2.643.5.1.13.13.12.2.78.8680",
    pptd:     "1.2.643.5.1.13.13.12.2.78.8574",
    beht:     "1.2.643.5.1.13.13.12.2.78.8807",
    hosp:     "1.2.643.5.1.13.13.12.2.78.8566"
};

startTnitialization();

function startTnitialization(){

    activatingButton("typeData", typeStatistic, "selectedSecond");
    activatingButton("dateTime", dateTimeLight, "selectedSecond");

    renderLinkedFilters();
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
    idLpu = listLpuId[LPU];
    abortAllDataRequests();
    resetLinkedSelections();
    resetDetailSelection();

    activatingButton("sideNav", id, "selectedMain");
      
    updateStatisticContent();

    if (typeStatistic == "lightStatictic")
        updateErrors();
    else
        updateLightStatisticContent(); 
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

function showChartLoader(){
    document.getElementById("chartLoader").style.display = "grid";
}

function hideChartLoader(){
    document.getElementById("chartLoader").style.display = "none";
}

function abortControllerSafe(controller) {
    if (controller) {
        controller.abort();
    }
}

function isAbortError(err) {
    return err && err.name === "AbortError";
}

function createErrorCountButton(value, errorMessage) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "detailCountButton badge-count";
    button.textContent = value;

    if (
        detailSourceType === "errorMessage" &&
        detailErrorMessage === errorMessage &&
        detailMedDocumentType === selectedMedDocumentType
    ) {
        button.classList.add("activeDetailButton");
    }

    button.addEventListener("click", function(event) {
        event.preventDefault();

        openErrorDetailTable(errorMessage);
    });

    return button;
}

function createDetailCountButton(value, className, medDocumentType, statusFilter, columnType) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `detailCountButton ${className}`;
    button.textContent = value;

    if (value == 0) {
        button.classList.add("disabledDetailButton");
    }

    if (
        detailMedDocumentType === medDocumentType &&
        detailStatusFilter === statusFilter &&
        detailColumnType === columnType
    ) {
        button.classList.add("activeDetailButton");
    }

    button.addEventListener("click", function(event) {
        event.preventDefault();

        if (Number(value) === 0) {
            return;
        }

        openDetailTable(medDocumentType, statusFilter, columnType);
    });

    return button;
}

function updateEmdErrors() {
    document.querySelectorAll(".dataKash tbody tr").forEach(elem => {
        elem.remove();
    });

    abortControllerSafe(emdErrorsController);
    emdErrorsController = new AbortController();

    let url = `${globalUrl}/main/emdErrorsLinked?${buildExtendedQuery({
        errorMessage: selectedErrorMessage
    })}`;

    fetch(url, { signal: emdErrorsController.signal })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then(commits => {
            let table = document.querySelector(".dataKash tbody");

            for (let i = 0; i < commits.length; i++) {
                let lineTable = document.createElement("tr");

                let medDocumentType = document.createElement("td");
                let count = document.createElement("td");
                let countErrors = document.createElement("td");
                let s2 = document.createElement("td");
                let s3 = document.createElement("td");
                let s5 = document.createElement("td");

                const currentMedDocumentType = commits[i].medDocumentType;

                const medDocumentButton = document.createElement("button");
                medDocumentButton.type = "button";
                medDocumentButton.className = "tableLinkButton";
                medDocumentButton.textContent = currentMedDocumentType;

                if (selectedMedDocumentType === currentMedDocumentType) {
                    medDocumentButton.classList.add("activeLink");
                }

                medDocumentButton.addEventListener("click", function(event) {
                    event.preventDefault();

                    selectedMedDocumentType =
                        selectedMedDocumentType === currentMedDocumentType ? "" : currentMedDocumentType;

                    renderLinkedFilters();
                    resetDetailSelection();
                    updateErrors("statisticErrors");
                });

                medDocumentType.appendChild(medDocumentButton);

                count.innerHTML = `<span class="badge-all-errors">${commits[i].count}</span>`;

                countErrors.appendChild(createDetailCountButton(
                    commits[i].countErrors,
                    commits[i].countErrors == 0 ? "badge-zero" : "badge-errors",
                    currentMedDocumentType,
                    "errors",
                    "countErrors"
                ));

                s2.appendChild(createDetailCountButton(
                    commits[i].s2,
                    commits[i].s2 == 0 ? "badge-zero" : "badge-s2",
                    currentMedDocumentType,
                    "2",
                    "s2"
                ));

                s3.appendChild(createDetailCountButton(
                    commits[i].s3,
                    commits[i].s3 == 0 ? "badge-zero" : "badge-s3",
                    currentMedDocumentType,
                    "3",
                    "s3"
                ));

                s5.appendChild(createDetailCountButton(
                    commits[i].s5,
                    commits[i].s5 == 0 ? "badge-zero" : "badge-s5",
                    currentMedDocumentType,
                    "5",
                    "s5"
                ));

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
            if (isAbortError(err)) {
                return;
            }

            alert('Произошла ошибка при загрузке данных');
            console.error(err);
        });
}

function updateStatisticErrors() {
    document.querySelectorAll(".dataKashErrors tbody tr").forEach(elem => {
        elem.remove();
    });

    abortControllerSafe(statisticErrorsController);
    statisticErrorsController = new AbortController();

    let url = `${globalUrl}/main/statisticErrorsLinked?${buildExtendedQuery({
        medDocumentType: selectedMedDocumentType
    })}`;

    fetch(url, { signal: statisticErrorsController.signal })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then(commits => {
            let table = document.querySelector(".dataKashErrors tbody");

            for (let i = 0; i < commits.length; i++) {
                let lineTable = document.createElement("tr");

                let error = document.createElement("td");
                let count = document.createElement("td");

                const currentErrorMessage = commits[i].message;

                const errorButton = document.createElement("button");
                errorButton.type = "button";
                errorButton.className = "tableLinkButton";
                errorButton.textContent = currentErrorMessage;

                if (selectedErrorMessage === currentErrorMessage) {
                    errorButton.classList.add("activeLink");
                }

                errorButton.addEventListener("click", function(event) {
                    event.preventDefault();

                    selectedErrorMessage =
                        selectedErrorMessage === currentErrorMessage ? "" : currentErrorMessage;

                    renderLinkedFilters();
                    resetDetailSelection();
                    updateErrors("emdErrors");
                });

                error.appendChild(errorButton);
                count.appendChild(createErrorCountButton(
                    commits[i].count,
                    currentErrorMessage
                ));

                lineTable.appendChild(error);
                lineTable.appendChild(count);

                table.appendChild(lineTable);
            }
        })
        .catch(err => {
            if (isAbortError(err)) {
                return;
            }

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

function updateLightStatisticContent() {
    clearLightStatistic();
    showChartLoader();

    abortControllerSafe(lightStatisticController);
    lightStatisticController = new AbortController();

    const url = `${globalUrl}/main/lightStatistic?organization=${idLpu}&start=${encodeURIComponent(startLight.toISOString())}&end=${encodeURIComponent(endLight.toISOString())}`;

    fetch(url, { signal: lightStatisticController.signal })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then(commits => {
            if (commits.length !== 1) {
                hideChartLoader();
                return;
            }

            const totalCount = Number(commits[0].count) || 0;

            if (totalCount <= 0) {
                hideChartLoader();
                clearLightStatistic();
                return;
            }

            const data = [
                { value: commits[0].s0 / totalCount * 100, color: "#969696" },
                { value: commits[0].s1 / totalCount * 100, color: "#00ABD3" },
                { value: commits[0].s2 / totalCount * 100, color: "#F47521" },
                { value: commits[0].s3 / totalCount * 100, color: "#338AA9" },
                { value: commits[0].s4 / totalCount * 100, color: "#00A78E" },
                { value: commits[0].s5 / totalCount * 100, color: "#976A65" }
            ];

            let s0 = document.querySelector(".s0 .row");
            s0.style.setProperty("--p", data[0].value);
            s0.querySelector(".bar").textContent = commits[0].s0 + " (" + (data[0].value.toFixed(2) < 1 ? "<1" : data[0].value.toFixed(2)) + "%)";

            let s1 = document.querySelector(".s1 .row");
            s1.style.setProperty("--p", data[1].value);
            s1.querySelector(".bar").textContent = commits[0].s1 + " (" + (data[1].value.toFixed(2) < 1 ? "<1" : data[1].value.toFixed(2)) + "%)";

            let s2 = document.querySelector(".s2 .row");
            s2.style.setProperty("--p", data[2].value);
            s2.querySelector(".bar").textContent = commits[0].s2 + " (" + (data[2].value.toFixed(2) < 1 ? "<1" : data[2].value.toFixed(2)) + "%)";

            let s3 = document.querySelector(".s3 .row");
            s3.style.setProperty("--p", data[3].value);
            s3.querySelector(".bar").textContent = commits[0].s3 + " (" + (data[3].value.toFixed(2) < 1 ? "<1" : data[3].value.toFixed(2)) + "%)";

            let s4 = document.querySelector(".s4 .row");
            s4.style.setProperty("--p", data[4].value);
            s4.querySelector(".bar").textContent = commits[0].s4 + " (" + (data[4].value.toFixed(2) < 1 ? "<1" : data[4].value.toFixed(2)) + "%)";

            let s5 = document.querySelector(".s5 .row");
            s5.style.setProperty("--p", data[5].value);
            s5.querySelector(".bar").textContent = commits[0].s5 + " (" + (data[5].value.toFixed(2) < 1 ? "<1" : data[5].value.toFixed(2)) + "%)";

            hideChartLoader();
            loadCanvas(data);
        })
        .catch(err => {
            if (isAbortError(err)) {
                return;
            }

            hideChartLoader();
            alert('Произошла ошибка при загрузке данных');
            console.error(err);
        })
        .finally(() => {
            if (lightStatisticController && lightStatisticController.signal.aborted) {
                return;
            }
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

    if (typeStatistic == "extendedStatictic") {
        resetDetailSelection();
    }

    abortControllerSafe(lightStatisticController);
    abortControllerSafe(emdErrorsController);
    abortControllerSafe(statisticErrorsController);

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
    resetDetailSelection();
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
        resetDetailSelection();
    }

    renderLinkedFilters();

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
            showNotification("Выберите начальную и конечную дату");
        }
        return false;
    }

    if (startValue > endValue) {
        if (showAlert) {
            showNotification("Дата начала не может быть больше даты окончания");
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

    if (typeStatistic === "extendedStatictic") {
        resetLinkedSelections();
        resetDetailSelection();
    }

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

function showNotification(text) {
    const notification = document.getElementById("notification");
    const notificationText = document.getElementById("notificationText");

    notificationText.textContent = text;

    notification.classList.add("show");

    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }

    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
        notificationTimer = null;
    }, 3000);
}

function buildExtendedQuery(extra = {}) {
    const params = new URLSearchParams({
        organization: idLpu,
        start: startExtended.toISOString(),
        end: endExtended.toISOString()
    });

    Object.entries(extra).forEach(([key, value]) => {
        if (value !== "") {
            params.append(key, value);
        }
    });

    return params.toString();
}

function renderLinkedFilters() {
    const wrapper = document.getElementById("linkedFilters");
    const medBlock = document.getElementById("medDocumentFilter");
    const errorBlock = document.getElementById("errorFilter");

    medBlock.style.display = "none";
    errorBlock.style.display = "none";

    if (typeStatistic !== "extendedStatictic") {
        wrapper.style.display = "none";
        return;
    }

    if (extendedStaticticType === "statisticErrors" && selectedMedDocumentType) {
        document.getElementById("medDocumentFilterText").textContent = selectedMedDocumentType;
        medBlock.style.display = "flex";
        wrapper.style.display = "flex";
        return;
    }

    if (extendedStaticticType === "emdErrors" && selectedErrorMessage) {
        document.getElementById("errorFilterText").textContent = selectedErrorMessage;
        errorBlock.style.display = "flex";
        wrapper.style.display = "flex";
        return;
    }

    wrapper.style.display = "none";
}

function resetLinkedSelections() {
    selectedMedDocumentType = "";
    selectedErrorMessage = "";
    renderLinkedFilters();
}

function refreshExtendedTables() {
    updateEmdErrors();
    updateStatisticErrors();
}

function resetDetailSelection() {
    detailMedDocumentType = "";
    detailStatusFilter = "";
    detailColumnType = "";
    detailErrorMessage = "";
    detailSourceType = "";

    detailOffset = 0;
    detailTotal = 0;

    abortControllerSafe(emdErrorDetailsController);

    hideDetailTable();
}

function hideDetailTable() {
    const overlay = document.getElementById("detailModalOverlay");
    const body = document.getElementById("detailTableBody");
    const title = document.getElementById("detailTitle");
    const paginationInfo = document.getElementById("detailPaginationInfo");

    if (overlay) {
        overlay.style.display = "none";
    }

    if (body) {
        body.innerHTML = "";
    }

    if (title) {
        title.textContent = "Список отправок";
    }

    if (paginationInfo) {
        paginationInfo.textContent = "Показано 0–0 из 0";
    }
}

function abortAllDataRequests() {
    abortControllerSafe(lightStatisticController);
    abortControllerSafe(emdErrorsController);
    abortControllerSafe(statisticErrorsController);
    abortControllerSafe(emdErrorDetailsController);
}

function updateDetailPaginationControls() {
    const prevButton = document.getElementById("detailPrevPage");
    const nextButton = document.getElementById("detailNextPage");
    const paginationInfo = document.getElementById("detailPaginationInfo");

    const from = detailTotal === 0 ? 0 : detailOffset + 1;
    const to = Math.min(detailOffset + detailPageSize, detailTotal);

    paginationInfo.textContent = `Показано ${from}–${to} из ${detailTotal}`;

    prevButton.disabled = detailOffset === 0;
    nextButton.disabled = detailOffset + detailPageSize >= detailTotal;
}

function getStatusTitle(statusFilter) {
    if (statusFilter === "errors") return "Отправки с ошибкой";
    if (statusFilter === "2") return "Статус 2 - Ошибка формирования";
    if (statusFilter === "3") return "Статус 3 - Ошибка первичной валидации";
    if (statusFilter === "5") return "Статус 5 - Документ отклонен ЕГИСЗ";
    return "Список отправок";
}

function openDetailTable(medDocumentType, statusFilter, columnType) {
    const isSameSelection =
        detailSourceType === "status" &&
        detailMedDocumentType === medDocumentType &&
        detailStatusFilter === statusFilter &&
        detailColumnType === columnType &&
        detailErrorMessage === selectedErrorMessage;

    if (isSameSelection) {
        resetDetailSelection();
        updateEmdErrors();
        return;
    }

    detailSourceType = "status";
    detailMedDocumentType = medDocumentType;
    detailStatusFilter = statusFilter;
    detailColumnType = columnType;
    detailErrorMessage = selectedErrorMessage;
    detailOffset = 0;

    updateEmdErrorDetails();
}

function openErrorDetailTable(errorMessage) {
    const isSameSelection =
        detailSourceType === "errorMessage" &&
        detailErrorMessage === errorMessage &&
        detailMedDocumentType === selectedMedDocumentType;

    if (isSameSelection) {
        resetDetailSelection();
        updateStatisticErrors();
        return;
    }

    detailSourceType = "errorMessage";
    detailErrorMessage = errorMessage;
    detailMedDocumentType = selectedMedDocumentType;
    detailStatusFilter = "";
    detailColumnType = "";
    detailOffset = 0;

    updateEmdErrorDetails();
}

function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ru-RU");
}

function updateEmdErrorDetails() {
    const body = document.getElementById("detailTableBody");
    const overlay = document.getElementById("detailModalOverlay");

    body.innerHTML = "";

    let titleText = "Список отправок";
    let query = {};

    if (detailSourceType === "status") {
        if (!detailMedDocumentType || !detailStatusFilter) {
            hideDetailTable();
            return;
        }

        const titleParts = [
            getStatusTitle(detailStatusFilter),
            `по документу: ${detailMedDocumentType}`
        ];

        if (detailErrorMessage) {
            titleParts.push(`ошибка: ${detailErrorMessage}`);
        }

        titleText = titleParts.join(" | ");

        query = {
            medDocumentType: detailMedDocumentType,
            errorMessage: detailErrorMessage,
            statusFilter: detailStatusFilter
        };
    }

    if (detailSourceType === "errorMessage") {
        if (!detailErrorMessage) {
            hideDetailTable();
            return;
        }

        const titleParts = [
            `Отправки с ошибкой: ${detailErrorMessage}`
        ];

        if (detailMedDocumentType) {
            titleParts.push(`по документу: ${detailMedDocumentType}`);
        }

        titleText = titleParts.join(" | ");

        query = {
            medDocumentType: detailMedDocumentType,
            errorMessage: detailErrorMessage
        };
    }

    document.getElementById("detailTitle").textContent = titleText;

    const params = new URLSearchParams({
        organization: idLpu,
        start: startExtended.toISOString(),
        end: endExtended.toISOString(),
        limit: detailPageSize,
        offset: detailOffset
    });

    Object.entries(query).forEach(([key, value]) => {
        if (value !== "") {
            params.append(key, value);
        }
    });

    const url = `${globalUrl}/main/emdErrorDetails?${params.toString()}`;

    abortControllerSafe(emdErrorDetailsController);
    emdErrorDetailsController = new AbortController();

    fetch(url, { signal: emdErrorDetailsController.signal })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then(result => {
            body.innerHTML = "";

            const rows = Array.isArray(result.rows) ? result.rows : [];
            detailTotal = Number(result.total) || 0;
            detailOffset = Number(result.offset) || 0;

            for (let i = 0; i < rows.length; i++) {
                const tr = document.createElement("tr");

                const tdIdDocument = document.createElement("td");
                const tdIdMis = document.createElement("td");
                const tdCreationDate = document.createElement("td");
                const tdLastAttemptDate = document.createElement("td");
                const tdStatus = document.createElement("td");
                const tdMessage = document.createElement("td");

                tdIdDocument.textContent = rows[i].idDocumentMis || "";
                tdIdMis.textContent = rows[i].idMis || "";
                tdCreationDate.textContent = formatDateTime(rows[i].creationDate);
                tdLastAttemptDate.textContent = formatDateTime(rows[i].lastAttemptDate);
                tdStatus.textContent = rows[i].currentStatus;
                tdMessage.textContent = rows[i].message || "";

                tr.appendChild(tdIdDocument);
                tr.appendChild(tdIdMis);
                tr.appendChild(tdCreationDate);
                tr.appendChild(tdLastAttemptDate);
                tr.appendChild(tdStatus);
                tr.appendChild(tdMessage);

                body.appendChild(tr);
            }

            overlay.style.display = "flex";
            updateDetailPaginationControls();
        })
        .catch(err => {
            if (isAbortError(err)) {
                return;
            }

            hideDetailTable();
            showNotification("Произошла ошибка при загрузке списка отправок");
            console.error(err);
        });
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
       
        if (typeStatistic == "extendedStatictic") {
            resetLinkedSelections();
            resetDetailSelection();
        }

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

document.getElementById("clearMedDocumentFilter")
    .addEventListener("click", function(event) {
        event.preventDefault();
        selectedMedDocumentType = "";
        renderLinkedFilters();
        resetDetailSelection();
        refreshExtendedTables();
    });

document.getElementById("clearErrorFilter")
    .addEventListener("click", function(event) {
        event.preventDefault();
        selectedErrorMessage = "";
        renderLinkedFilters();
        resetDetailSelection();
        refreshExtendedTables();
    });

document.getElementById("closeDetailTable")
    .addEventListener("click", function(event) {
        event.preventDefault();
        resetDetailSelection();
        updateEmdErrors();
        updateStatisticErrors();
    });

document.getElementById("detailModalOverlay")
    .addEventListener("click", function(event) {
        if (event.target.id === "detailModalOverlay") {
            resetDetailSelection();
            updateEmdErrors();
            updateStatisticErrors();
        }
    });

document.getElementById("detailPrevPage")
    .addEventListener("click", function(event) {
        event.preventDefault();

        if (detailOffset === 0) {
            return;
        }

        detailOffset = Math.max(0, detailOffset - detailPageSize);
        updateEmdErrorDetails();
    });

document.getElementById("detailNextPage")
    .addEventListener("click", function(event) {
        event.preventDefault();

        if (detailOffset + detailPageSize >= detailTotal) {
            return;
        }

        detailOffset += detailPageSize;
        updateEmdErrorDetails();
    });