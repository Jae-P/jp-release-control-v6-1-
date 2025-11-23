// Simple state + localStorage setup

const STORAGE_KEY = "jp_release_manager_v1";
const BUSINESS_STORAGE_KEY = "jp_business_manager_v1";

const CHECKLIST_CONFIG = {
  basics: [
    { key: "recordingDone", label: "Recording finished" },
    { key: "mixApproved", label: "Mix approved" },
    { key: "masterApproved", label: "Master approved" },
    { key: "coverArtReady", label: "Cover art approved" },
  ],
  rights: [
    { key: "splitsConfirmed", label: "Splits confirmed & documented" },
    { key: "proRegistered", label: "Song registered with PRO" },
    { key: "contractsSigned", label: "Key contracts signed (producer / feat)" },
  ],
  distribution: [
    { key: "distributorSelected", label: "Distributor selected" },
    { key: "metadataUploaded", label: "Metadata & audio uploaded" },
    { key: "releaseDateConfirmed", label: "Release date confirmed in distributor" },
    { key: "preSaveLink", label: "Pre-save / pre-order link created" },
  ],
  marketing: [
    { key: "socialPlan", label: "Social & content plan ready" },
    { key: "pitchPlaylists", label: "Pitch sent to playlists / editors" },
    { key: "epkReady", label: "EPK ready (bio, photos, links)" },
  ],
};

// Global business / label roadmap checklists
// Each item can include optional 'links' array with { label, href }
const BUSINESS_CHECKLIST_CONFIG = {
  companyProfile: [
    {
      key: "nameOptions",
      label: "Choose 2–3 business / publishing name options.",
    },
    {
      key: "registerState",
      label: "Register your business (DBA, LLC or Corp) with your state.",
      links: [
        { label: "SBA Guide", href: "https://www.sba.gov/business-guide/launch-your-business/register-your-business" },
      ],
    },
    {
      key: "ein",
      label: "Get an EIN from the IRS.",
      links: [
        { label: "IRS EIN", href: "https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers" },
      ],
    },
    {
      key: "bankAccount",
      label: "Open a dedicated business bank account.",
    },
  ],
  publishingEntity: [
    {
      key: "choosePRO",
      label: "Decide your PRO (BMI, ASCAP or SESAC) for this catalog.",
      links: [
        { label: "BMI", href: "https://www.bmi.com/join" },
        { label: "ASCAP", href: "https://www.ascap.com/join" },
        { label: "SESAC", href: "https://www.sesac.com/#/join" },
      ],
    },
    {
      key: "joinWriter",
      label: "Join your PRO as a songwriter (writer account).",
      links: [
        { label: "BMI Writer", href: "https://www.bmi.com/join" },
        { label: "ASCAP Writer", href: "https://www.ascap.com/join" },
      ],
    },
    {
      key: "joinPublisher",
      label: "Create a publishing company account with your PRO.",
      links: [
        { label: "BMI Publisher", href: "https://www.bmi.com/join" },
        { label: "ASCAP Publisher", href: "https://www.ascap.com/join" },
      ],
    },
    {
      key: "ipiNumbers",
      label: "Write down your writer & publisher IPI/CAE numbers.",
    },
    {
      key: "publishingAdmin",
      label: "Open a publishing admin account (Songtrust or similar).",
      links: [
        { label: "Songtrust Signup", href: "https://app.songtrust.com/signup" },
      ],
    },
    {
      key: "connectAdmin",
      label: "Connect publishing admin with your PRO / catalog (where possible).",
    },
  ],
  contractsCore: [
    { key: "splitSheet", label: "Songwriter & producer split sheet template ready." },
    { key: "producerAgreement", label: "Producer agreement template (fees / points)." },
    { key: "featureAgreement", label: "Feature artist agreement template." },
    { key: "workForHire", label: "Work-for-hire template for artwork / visuals." },
  ],
  contractsAdvanced: [
    { key: "managementDeal", label: "Management agreement template (if needed)." },
    { key: "labelDeal", label: "Label / joint venture agreement outline." },
    { key: "syncLicense", label: "Basic sync license template for placements." },
  ],
  royaltiesAccounts: [
    { key: "proAccount", label: "PRO accounts active (writer & publisher)." },
    {
      key: "soundExchange",
      label: "SoundExchange account created.",
      links: [
        { label: "SoundExchange", href: "https://www.soundexchange.com" },
      ],
    },
    {
      key: "publishingAdmin",
      label: "Publishing admin account (Songtrust, etc.) active.",
      links: [
        { label: "Songtrust", href: "https://app.songtrust.com" },
      ],
    },
    {
      key: "spotifyArtists",
      label: "Spotify for Artists claimed.",
      links: [
        { label: "Spotify for Artists", href: "https://artists.spotify.com" },
      ],
    },
    {
      key: "appleArtists",
      label: "Apple Music for Artists claimed.",
      links: [
        { label: "Apple for Artists", href: "https://artists.apple.com" },
      ],
    },
  ],
  royaltiesPerRelease: [
    { key: "proSongRegistered", label: "Song registered with PRO (composition)." },
    {
      key: "soundRecordingReported",
      label: "Sound recording reported to SoundExchange (where applicable).",
    },
    {
      key: "songtrustRegistered",
      label: "Song added to publishing admin system (Songtrust or similar).",
    },
    {
      key: "idsLogged",
      label: "ISRC / UPC / ISWC written down in your system.",
    },
  ],
};

let releases = [];
let selectedReleaseId = null;
let businessState = {};

// ---- Utils ----

function createEmptyChecklists() {
  const data = {};
  Object.keys(CHECKLIST_CONFIG).forEach((section) => {
    data[section] = {};
    CHECKLIST_CONFIG[section].forEach((item) => {
      data[section][item.key] = false;
    });
  });
  return data;
}

function createEmptyBusinessChecklists() {
  const data = {};
  Object.keys(BUSINESS_CHECKLIST_CONFIG).forEach((section) => {
    data[section] = {};
    BUSINESS_CHECKLIST_CONFIG[section].forEach((item) => {
      data[section][item.key] = false;
    });
  });
  return data;
}

function loadReleases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with one sample release so it doesn't look empty
      const sample = {
        id: "sample_amame",
        title: "ÁMAME",
        artist: "Jae-P ft. Jexy",
        type: "Single",
        status: "In Progress",
        date: "",
        checklists: createEmptyChecklists(),
      };
      releases = [sample];
      saveReleases();
      return;
    }
    releases = JSON.parse(raw) || [];
  } catch (err) {
    console.error("Error loading releases from storage:", err);
    releases = [];
  }
}

function saveReleases() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
}

function loadBusinessState() {
  try {
    const raw = localStorage.getItem(BUSINESS_STORAGE_KEY);
    if (!raw) {
      businessState = createEmptyBusinessChecklists();
      saveBusinessState();
      return;
    }
    businessState = JSON.parse(raw) || createEmptyBusinessChecklists();
  } catch (err) {
    console.error("Error loading business state:", err);
    businessState = createEmptyBusinessChecklists();
  }
}

function saveBusinessState() {
  localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(businessState));
}

function getReleaseById(id) {
  return releases.find((r) => r.id === id) || null;
}

function calculateProgress(release) {
  const cl = release.checklists || {};
  let total = 0;
  let done = 0;

  Object.keys(CHECKLIST_CONFIG).forEach((section) => {
    (CHECKLIST_CONFIG[section] || []).forEach((item) => {
      total++;
      if (cl[section] && cl[section][item.key]) done++;
    });
  });

  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

// ---- DOM refs ----

const navButtons = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const viewTitle = document.getElementById("viewTitle");
const viewSubtitle = document.getElementById("viewSubtitle");

const dashboardReleaseList = document.getElementById("dashboardReleaseList");
const emptyState = document.getElementById("emptyState");
const emptyNewReleaseBtn = document.getElementById("emptyNewReleaseBtn");

const statTotalReleases = document.getElementById("statTotalReleases");
const statInProgress = document.getElementById("statInProgress");
const statCompleted = document.getElementById("statCompleted");

const releasesTableBody = document.querySelector("#releasesTable tbody");

const detailsPanel = document.getElementById("detailsPanel");
const detailsTitle = document.getElementById("detailsTitle");
const detailsSubtitle = document.getElementById("detailsSubtitle");
const detailsStatusSelect = document.getElementById("detailsStatusSelect");
const detailsProgressBar = document.getElementById("detailsProgressBar");
const detailsProgressLabel = document.getElementById("detailsProgressLabel");
const detailsTitleInput = document.getElementById("detailsTitleInput");
const detailsArtistInput = document.getElementById("detailsArtistInput");
const detailsTypeSelect = document.getElementById("detailsTypeSelect");
const detailsDateInput = document.getElementById("detailsDateInput");

const checklistBasics = document.getElementById("checklistBasics");
const checklistRights = document.getElementById("checklistRights");
const checklistDistribution = document.getElementById("checklistDistribution");
const checklistMarketing = document.getElementById("checklistMarketing");

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

const newReleaseBtn = document.getElementById("newReleaseBtn");
const releaseModal = document.getElementById("releaseModal");
const releaseForm = document.getElementById("releaseForm");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const formTitle = document.getElementById("formTitle");
const formArtist = document.getElementById("formArtist");
const formType = document.getElementById("formType");
const formStatus = document.getElementById("formStatus");
const formDate = document.getElementById("formDate");

// Business checklist DOM refs
const bizCompanyProfile = document.getElementById("bizCompanyProfile");
const bizPublishingEntity = document.getElementById("bizPublishingEntity");
const bizContractsCore = document.getElementById("bizContractsCore");
const bizContractsAdvanced = document.getElementById("bizContractsAdvanced");
const bizRoyaltiesAccounts = document.getElementById("bizRoyaltiesAccounts");
const bizRoyaltiesPerRelease = document.getElementById("bizRoyaltiesPerRelease");

// ---- View switching ----

const VIEW_TITLES = {
  dashboardView: {
    title: "Dashboard",
    subtitle: "Overview of all your releases and business progress.",
  },
  releasesView: {
    title: "Releases",
    subtitle: "Manage every single, EP and album with pro-level structure.",
  },
  companyView: {
    title: "Business & Publishing",
    subtitle: "From zero to professional business and publishing setup.",
  },
  contractsView: {
    title: "Contracts",
    subtitle: "Make sure every collaborator and investor is covered.",
  },
  royaltiesView: {
    title: "Royalties & Admin",
    subtitle: "Set up your admin side so no royalty gets lost.",
  },
  consultingView: {
    title: "Consulting & Management",
    subtitle: "Hire Jae-P to guide your releases and label structure.",
  },
};

function setActiveView(viewId) {
  views.forEach((v) => v.classList.toggle("active", v.id === viewId));
  navButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.view === viewId)
  );

  const meta = VIEW_TITLES[viewId];
  if (meta) {
    viewTitle.textContent = meta.title;
    viewSubtitle.textContent = meta.subtitle;
  }

  // Show details panel only in Releases view
  if (viewId === "releasesView" && selectedReleaseId) {
    renderDetailsPanel();
  } else {
    detailsPanel.classList.add("hidden");
  }
}

// ---- Rendering ----

function renderStats() {
  const total = releases.length;
  const inProgress = releases.filter((r) => r.status !== "Released").length;
  const completed = releases.filter((r) => r.status === "Released").length;

  statTotalReleases.textContent = total;
  statInProgress.textContent = inProgress;
  statCompleted.textContent = completed;
}

function statusClass(status) {
  switch (status) {
    case "In Planning":
      return "status-planning";
    case "In Progress":
      return "status-progress";
    case "Ready to Release":
      return "status-ready";
    case "Released":
      return "status-released";
    default:
      return "";
  }
}

function renderDashboardList() {
  dashboardReleaseList.innerHTML = "";

  if (releases.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  releases.forEach((release) => {
    const card = document.createElement("article");
    card.className = "release-card";
    card.dataset.id = release.id;

    const progress = calculateProgress(release);
    const typeLabel = release.type || "Release";

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
        <div>
          <h4 class="release-title">${release.title || "Untitled release"}</h4>
          <p class="release-meta">${release.artist || "Unknown artist"}</p>
        </div>
        <span class="tag ${statusClass(release.status)}">${release.status || ""}</span>
      </div>
      <p class="release-meta">${typeLabel}${release.date ? " • " + release.date : ""}</p>
      <div class="progress-pill">
        <div class="progress-pill-inner" style="width:${progress}%;"></div>
      </div>
    `;

    card.addEventListener("click", () => {
      selectedReleaseId = release.id;
      setActiveView("releasesView");
      renderDetailsPanel();
    });

    dashboardReleaseList.appendChild(card);
  });
}

function renderReleasesTable() {
  releasesTableBody.innerHTML = "";

  releases.forEach((release) => {
    const row = document.createElement("tr");
    const progress = calculateProgress(release);

    row.innerHTML = `
      <td>${release.title || "Untitled release"}</td>
      <td>${release.artist || ""}</td>
      <td>${release.type || ""}</td>
      <td>${release.status || ""}</td>
      <td>${release.date || ""}</td>
      <td>${progress}%</td>
    `;

    row.addEventListener("click", () => {
      selectedReleaseId = release.id;
      setActiveView("releasesView");
      renderDetailsPanel();
    });

    releasesTableBody.appendChild(row);
  });
}

function renderChecklist(ulElement, sectionKey, release) {
  ulElement.innerHTML = "";
  const sectionConfig = CHECKLIST_CONFIG[sectionKey];
  const state = release.checklists[sectionKey] || {};

  sectionConfig.forEach((item) => {
    const li = document.createElement("li");
    const id = `${sectionKey}_${item.key}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = !!state[item.key];

    checkbox.addEventListener("change", () => {
      state[item.key] = checkbox.checked;
      release.checklists[sectionKey] = state;
      saveReleases();
      renderStats();
      renderDashboardList();
      renderReleasesTable();
      updateDetailsProgress(release);
    });

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = item.label;

    li.appendChild(checkbox);
    li.appendChild(label);
    ulElement.appendChild(li);
  });
}

function renderBusinessChecklist(ulElement, sectionKey) {
  if (!ulElement) return;
  ulElement.innerHTML = "";

  const sectionConfig = BUSINESS_CHECKLIST_CONFIG[sectionKey];
  const state = businessState[sectionKey] || {};

  sectionConfig.forEach((item) => {
    const li = document.createElement("li");
    const id = `biz_${sectionKey}_${item.key}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = !!state[item.key];

    checkbox.addEventListener("change", () => {
      state[item.key] = checkbox.checked;
      businessState[sectionKey] = state;
      saveBusinessState();
    });

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = item.label;

    li.appendChild(checkbox);
    li.appendChild(label);

    if (item.links && item.links.length) {
      const linksContainer = document.createElement("span");
      linksContainer.className = "checklist-links";
      item.links.forEach((link) => {
        const a = document.createElement("a");
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = link.label;
        linksContainer.appendChild(a);
      });
      li.appendChild(linksContainer);
    }

    ulElement.appendChild(li);
  });
}

function renderBusinessSections() {
  renderBusinessChecklist(bizCompanyProfile, "companyProfile");
  renderBusinessChecklist(bizPublishingEntity, "publishingEntity");
  renderBusinessChecklist(bizContractsCore, "contractsCore");
  renderBusinessChecklist(bizContractsAdvanced, "contractsAdvanced");
  renderBusinessChecklist(bizRoyaltiesAccounts, "royaltiesAccounts");
  renderBusinessChecklist(bizRoyaltiesPerRelease, "royaltiesPerRelease");
}

function updateDetailsProgress(release) {
  const progress = calculateProgress(release);
  detailsProgressBar.style.width = `${progress}%`;
  detailsProgressLabel.textContent = `${progress}%`;
}

function renderDetailsPanel() {
  const release = getReleaseById(selectedReleaseId);
  if (!release) {
    detailsPanel.classList.add("hidden");
    return;
  }

  detailsPanel.classList.remove("hidden");

  detailsTitle.textContent = release.title || "Untitled release";
  detailsSubtitle.textContent = `${release.artist || ""} • ${release.type || ""}`;

  detailsStatusSelect.value = release.status || "In Progress";
  detailsTitleInput.value = release.title || "";
  detailsArtistInput.value = release.artist || "";
  detailsTypeSelect.value = release.type || "Single";
  detailsDateInput.value = release.date || "";

  // Render checklists
  renderChecklist(checklistBasics, "basics", release);
  renderChecklist(checklistRights, "rights", release);
  renderChecklist(checklistDistribution, "distribution", release);
  renderChecklist(checklistMarketing, "marketing", release);

  updateDetailsProgress(release);
}

// ---- Modal handling ----

function openModal() {
  releaseModal.classList.remove("hidden");
  releaseForm.reset();
  formType.value = "Single";
  formStatus.value = "In Progress";
}

function closeModal() {
  releaseModal.classList.add("hidden");
}

function handleNewReleaseSubmit(evt) {
  evt.preventDefault();

  const data = {
    id: `rel_${Date.now()}`,
    title: formTitle.value.trim() || "Untitled release",
    artist: formArtist.value.trim(),
    type: formType.value,
    status: formStatus.value,
    date: formDate.value,
    checklists: createEmptyChecklists(),
  };

  releases.push(data);
  saveReleases();
  closeModal();

  selectedReleaseId = data.id;
  renderEverything();
  setActiveView("releasesView");
  renderDetailsPanel();
}

// ---- Details field updates ----

function attachDetailFieldListeners() {
  detailsStatusSelect.addEventListener("change", () => {
    const r = getReleaseById(selectedReleaseId);
    if (!r) return;
    r.status = detailsStatusSelect.value;
    saveReleases();
    renderStats();
    renderDashboardList();
    renderReleasesTable();
  });

  detailsTitleInput.addEventListener("input", () => {
    const r = getReleaseById(selectedReleaseId);
    if (!r) return;
    r.title = detailsTitleInput.value;
    detailsTitle.textContent = r.title || "Untitled release";
    saveReleases();
    renderDashboardList();
    renderReleasesTable();
  });

  detailsArtistInput.addEventListener("input", () => {
    const r = getReleaseById(selectedReleaseId);
    if (!r) return;
    r.artist = detailsArtistInput.value;
    saveReleases();
    renderDashboardList();
    renderReleasesTable();
  });

  detailsTypeSelect.addEventListener("change", () => {
    const r = getReleaseById(selectedReleaseId);
    if (!r) return;
    r.type = detailsTypeSelect.value;
    saveReleases();
    renderDashboardList();
    renderReleasesTable();
  });

  detailsDateInput.addEventListener("change", () => {
    const r = getReleaseById(selectedReleaseId);
    if (!r) return;
    r.date = detailsDateInput.value;
    saveReleases();
    renderDashboardList();
    renderReleasesTable();
  });
}

// ---- Tabs ----

function attachTabHandlers() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;

      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      tabContents.forEach((c) => c.classList.toggle("active", c.id === tabId));
    });
  });
}

// ---- Init ----

function renderEverything() {
  renderStats();
  renderDashboardList();
  renderReleasesTable();
  renderBusinessSections();
}

function attachNavHandlers() {
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveView(btn.dataset.view);
    });
  });
}

function attachModalHandlers() {
  newReleaseBtn.addEventListener("click", openModal);
  cancelModalBtn.addEventListener("click", closeModal);
  releaseModal.addEventListener("click", (evt) => {
    if (evt.target === releaseModal) {
      closeModal();
    }
  });
  releaseForm.addEventListener("submit", handleNewReleaseSubmit);
  if (emptyNewReleaseBtn) {
    emptyNewReleaseBtn.addEventListener("click", openModal);
  }
}

// Run

document.addEventListener("DOMContentLoaded", () => {
  loadReleases();
  loadBusinessState();
  attachNavHandlers();
  attachModalHandlers();
  attachTabHandlers();
  attachDetailFieldListeners();
  renderEverything();
});
