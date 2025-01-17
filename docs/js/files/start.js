// Start Load
const appData = { youtube: {}, ai: { using: false } };
appData.emitter = new EventEmitter();

// Start Document
console.groupCollapsed("App Information");
console.log(
  `Fanfic Engine Creator: Yasmin Seidel (JasminDreasond) https://github.com/JasminDreasond`,
);
console.log(`Name: ${storyCfg.title}`);
console.log(`Description: ${storyCfg.description}`);
console.log(`Author: ${storyCfg.creator}`);
console.log(`Author Page: ${storyCfg.creator_url}`);
console.log(`Age Rating: ${storyCfg.ageRating}`);
console.log(
  `Github Repository: https://github.com/${storyCfg.github.account}/${storyCfg.github.repository}`,
);
console.log(`Tags`, storyCfg.tags);
console.groupEnd();

// Roleplay format
const renderRoleplayFormat = (chapter) => {
  let data = "";

  let day = null;
  let dayNightCycle = null;
  let weather = null;
  let where = null;

  for (const item in storyData.data[chapter]) {
    const lineText = `[Fic Line ${Number(item) + 1}]`;
    const ficData = storyData.data[chapter][item];

    if (ficData.set) {
      if (typeof ficData.set.day === "number") {
        if (day !== null) data += `\n) `;
        day = ficData.set.day;
        data += `(Day Number: ${day}`;
      }

      if (typeof ficData.set.dayNightCycle === "string") {
        if (dayNightCycle !== null) data += `\n) `;
        dayNightCycle = ficData.set.dayNightCycle;
        data += `(Day Status: ${dayNightCycle}`;
      }

      if (typeof ficData.set.weather === "string") {
        if (weather !== null) data += `\n) `;
        weather = ficData.set.weather;
        data += `(Weather: ${weather}`;
      }

      if (typeof ficData.set.where === "string") {
        if (where !== null) data += `\n) `;
        where = ficData.set.where;
        data += `(Location: ${where}`;
      }
    }

    const isFlashBack = ficData.flashback ? " from flashback scene" : "";

    if (ficData.type === "action") data += `\n${lineText} *${ficData.value}*`;

    if (ficData.type === "think")
      data += `\n${lineText} ${ficData.character}'s thinks${isFlashBack}: ${ficData.value}`;
    if (ficData.type === "telepathy")
      data += `\n${lineText} ${ficData.character}'s telepathy voice${isFlashBack}: ${ficData.value}`;
    if (ficData.type === "dialogue")
      data += `\n${lineText} ${ficData.character}${isFlashBack}: ${ficData.value}`;
  }
  return data;
};

const saveRoleplayFormat = (chapter) => {
  let file = "";

  const insertChapter = (cpId) => {
    file += `\n\n---------- Chapter ${cpId} ----------\n`;
    file += renderRoleplayFormat(cpId);
    file += `\n\n---------- The end chapter ${cpId} ----------`;
  };

  if (typeof chapter !== "number") {
    for (let i = 0; i < storyData.chapter.amount; i++) {
      const item = i + 1;
      insertChapter(item);
    }
  } else {
    insertChapter(chapter);
  }

  file = file.substring(2, file.length);

  let info = `Title: ${storyData.title}\nDescription: ${storyData.description}\nAuthor: ${storyCfg.creator}\nAuthor Page: ${storyCfg.creator_url}`;
  if (
    (storyCfg.bitcoin && storyCfg.bitcoin.address) ||
    (storyCfg.dogecoin && storyCfg.dogecoin.address) ||
    (storyCfg.ethereum && storyCfg.ethereum.address) ||
    (storyCfg.polygon && storyCfg.polygon.address) ||
    (storyCfg.bnb && storyCfg.bnb.address)
  ) {
    info += `\n`;
  }

  if (storyCfg.bitcoin && storyCfg.bitcoin.address) {
    info += `\nBitcoin Donations: ${storyCfg.bitcoin.address}`;
  }

  if (storyCfg.dogecoin && storyCfg.dogecoin.address) {
    info += `\nDogecoin Donations: ${storyCfg.dogecoin.address}`;
  }

  if (storyCfg.ethereum && storyCfg.ethereum.address) {
    info += `\nEthereum Donations: ${storyCfg.ethereum.address}`;
  }

  if (storyCfg.polygon && storyCfg.polygon.address) {
    info += `\nPolygon Donations: ${storyCfg.polygon.address}`;
  }

  if (storyCfg.bnb && storyCfg.bnb.address) {
    info += `\nBNB Donations: ${storyCfg.bnb.address}`;
  }

  saveAs(
    new Blob([`${info}\n\n${file}`], { type: "text/plain" }),
    `Pony Driland${!chapter ? "" : ` - Chapter ${chapter}`}.txt`,
  );
};

const dice = {
  roll: function () {
    return (randomNumber = Math.floor(Math.random() * this.sides) + 1);
  },
};

if (Array.isArray(storyCfg.mirror) || storyCfg.mirror.length > 0) {
  dice.sides = storyCfg.mirror.length;
} else {
  dice.sides = 0;
}

// URL Update
const urlUpdate = function (url, title, isPopState = false, extra = {}) {
  // Page Title
  if (typeof title !== "string" || title.length < 1) {
    title = storyCfg.title;
  }

  if (url === "ai") {
    if (!appData.ai.using) {
      appData.ai.using = true;
      appData.emitter.emit("isUsingAI", true);
    }
  } else {
    if (appData.ai.using) {
      appData.ai.using = false;
      appData.emitter.emit("isUsingAI", false);
    }
  }

  let newUrl =
    typeof url === "string" &&
    !url.startsWith("/") &&
    url !== "read-fic" &&
    url !== "ai"
      ? `/${url}`
      : url;

  let extraReady = "";
  for (const item in extra) {
    extraReady += `&${item}=${extra[item]}`;
  }

  document.title = title;
  storyData.urlPage = newUrl;

  // Google
  if (typeof storyCfg.gtag === "string" && gtag) {
    gtag("event", "url", {
      event_title: title,
      event_category: "open_url",
      url: newUrl,
    });
  }

  // Pop State
  if (!isPopState) {
    if (typeof newUrl === "string" && newUrl.length > 0) {
      if (!storyCfg.custom_url[newUrl]) {
        window.history.pushState(
          { pageTitle: title },
          "",
          "/?path=" + encodeURIComponent(newUrl) + extraReady,
        );
      } else {
        window.history.pushState(
          { pageTitle: storyCfg.custom_url[newUrl].title },
          "",
          storyCfg.custom_url[newUrl].url + extraReady,
        );
      }
    } else {
      window.history.pushState({ pageTitle: title }, "", "/");
    }
  }
};

const openNewAddress = function (data, isPopState = false, useCustom = false) {
  // File Path
  const filePath = data.path;

  // Prepare Custom URL
  if (useCustom && storyCfg.custom_url[data.path]) {
    isPopState = false;
  }

  if (
    !data ||
    typeof filePath !== "string" ||
    filePath.length < 1 ||
    !filePath.startsWith("/") ||
    filePath.indexOf("http://") > -1 ||
    filePath.indexOf("https://") > -1
  ) {
    insertMarkdownFile(storyData.readme, true, true);
  } else {
    openMDFile(filePath);
    if (typeof data.title === "string" && data.title.length > 0) {
      urlUpdate(data.path, data.title, isPopState);
    } else {
      urlUpdate(data.path, null, isPopState);
    }
  }
};

// Pop State
$(window).on("popstate", function () {
  // Remove Fic Data
  clearFicData();

  // Get Params
  const urlSearchParams = new URLSearchParams(document.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  // Load Page
  const loadPage = function () {
    if (storyData.urlPage !== params.path) {
      storyData.urlPage = params.path;
      if (params.path === "read-fic") openChapterMenu(params);
      if (params.path === "ai") return;
      else openNewAddress(params, true);
    }
  };

  // Default
  if (document.location.pathname === "/") {
    loadPage();
  }

  // Custom
  else {
    // Get Data
    const urlData = Object.entries(storyCfg.custom_url).find(
      (item) => item[1].url === document.location.pathname,
    );
    if (urlData) {
      params.path = urlData[0];
      params.title = urlData[1].title;
      loadPage();
    }
  }
});

// Insert Maarkdown File
const insertMarkdownFile = function (text, isMainPage = false, isHTML = false) {
  // Prepare Convert Base
  const convertBase = `https\\:\\/\\/github.com\\/${storyCfg.github.account}\\/${storyCfg.github.repository}\\/blob\\/main\\/`;

  // Convert Data
  let data;

  if (!isHTML) {
    data = marked.parse(text);
  } else {
    data = text;
  }

  data = data
    .replace(
      new RegExp(`href\=\"${convertBase}docs\\/`, "g"),
      'href="javascript:void(0)" file="../',
    )
    .replace(new RegExp(`src\=\"${convertBase}docs\\/`, "g"), 'src="../')
    .replace(
      new RegExp(`src\=\"https\:\/\/ipfs\.io\/ipfs\/`, "g"),
      'src="https://cloudflare-ipfs.com/ipfs/',
    );

  // Insert Data
  $("#markdown-read").empty().html(data);
  if (isMainPage) {
    $("#top_page").removeClass("d-none");
  } else {
    $("#top_page").addClass("d-none");
  }

  // Convert File URLs
  $('[id="markdown-read"] a[file]')
    .removeAttr("target")
    .on("click", function () {
      openMDFile($(this).attr("file"));
    });

  // Fix Image
  $('[id="markdown-read"] img').each(function () {
    if ($(this).parents("a").length < 1) {
      // New Image Item
      const src = $(this).attr("src");
      const newImage = $("<img>", { class: "img-fluid" })
        .css("height", $(this).attr("height"))
        .css("width", $(this).attr("width"));
      $(this).replaceWith(newImage);

      // Load Image FIle
      const pswpElement = document.querySelectorAll(".pswp")[0];
      newImage
        .css({
          cursor: "pointer",
          opacity: "0%",
          "pointer-events": "",
        })
        .on("load", function () {
          const newImg = new Image();
          const tinyThis = $(this);

          newImg.onload = function () {
            tinyThis.data("image-size", {
              width: this.width,
              height: this.height,
            });
            tinyThis.css({ opacity: "100%", "pointer-events": "" });
          };

          newImg.src = $(this).attr("src");
        })
        .on("click", function () {
          const imgSize = $(this).data("image-size");
          const gallery = new PhotoSwipe(
            pswpElement,
            PhotoSwipeUI_Default,
            [{ src: $(this).attr("src"), h: imgSize.height, w: imgSize.width }],
            { index: 0 },
          );
          gallery.init();
          $(this).fadeTo("fast", 0.7, function () {
            $(this).fadeTo("fast", 1);
          });
          return false;
        })
        .hover(
          function () {
            $(this).fadeTo("fast", 0.8);
          },
          function () {
            $(this).fadeTo("fast", 1);
          },
        );

      // Load Image
      newImage.attr("src", src);

      const newTinyPlace = $("<p>", { class: "mt-4" });
      newTinyPlace.insertAfter(newImage);
    }
  });
};

// Remove Fic Data
const clearFicData = function () {
  for (const item in storyData.sfx) {
    if (typeof storyData.sfx[item].hide === "function") {
      storyData.sfx[item].hide(0);
    }

    if (
      storyData.sfx[item].pizzicato &&
      typeof storyData.sfx[item].pizzicato.hide === "function"
    ) {
      storyData.sfx[item].pizzicato.hide(0);
    }
  }

  $("body")
    .removeClass("ficMode")
    .removeClass(`fic-daycicle-morning`)
    .removeClass(`fic-daycicle-evening`)
    .removeClass(`fic-daycicle-night`)
    .removeClass(`fic-daycicle-lateAtNight`);

  $("#fic-nav > #status").empty();
  $("#fic-chapter").empty();
  storyData.readFic = false;
  storyData.chapter.html = {};
  storyData.chapter.line = null;
  storyData.chapter.nav = {};
  storyData.chapter.selected = 0;

  if (
    storyData.youtube.player &&
    storyData.youtube.checkYT() &&
    storyData.youtube.state === YT.PlayerState.PLAYING
  ) {
    storyData.youtube.player.stopVideo();
  }
};

// Open MD FIle
const openMDFile = function (url, isMain = false) {
  if (typeof url === "string") {
    // Remove Fic Data
    clearFicData();

    // New page
    if (url !== "MAIN") {
      // Read Data Base
      console.log(`Opening MD file "${url}"...`);
      $.LoadingOverlay("show", { background: "rgba(0,0,0, 0.5)" });

      // Load ajax
      $.ajax({
        url: `${url.startsWith("/") ? url : `/${url}`}${fileVersion}`,
        type: "get",
        dataType: "text",
      })
        // Complete
        .done(function (fileData) {
          try {
            const fileLines = tinyLib.mdManager.removeMetadata(fileData);
            const metadata = tinyLib.mdManager.extractMetadata(fileData);
            const title = metadata.title;

            if (url.endsWith(".md")) {
              console.log(`MD File opened successfully!`);
              insertMarkdownFile(fileLines, isMain, false);
            } else {
              console.log(`HTML File opened successfully!`);
              insertMarkdownFile(fileLines, isMain, true);
            }

            tinyLib.goToByScrollTop(0);
            $.LoadingOverlay("hide");
            urlUpdate(url, title);
          } catch (err) {
            $.LoadingOverlay("hide");
            console.error(err);
            alert(err.message);
          }
        })

        // Fail
        .fail((err) => {
          $.LoadingOverlay("hide");
          console.error(err);
          alert(err.message);
        });
    }

    // Main page
    else {
      insertMarkdownFile(storyData.readme, isMain, true);
      urlUpdate();
    }
    return;
  }
  throw new Error("Invalid Md File Url!");
};

// Start App
$(() => {
  const startApp = () => {
    console.log("Starting App...");
    storyData.start((fn, readme) => {
      const tinyAiScript = AiScriptStart();

      // Crypto Allow Detector
      if (
        storyData.ipRegistry &&
        storyData.ipRegistry.location &&
        storyData.ipRegistry.location.country &&
        typeof storyData.ipRegistry.location.country.code === "string"
      ) {
        storyData.allowCrypto = true;
        if (Array.isArray(storyCfg.cryptoBlock)) {
          for (const item in storyCfg.cryptoBlock) {
            if (
              storyData.ipRegistry.location.country.code ===
              storyCfg.cryptoBlock[item]
            ) {
              storyData.allowCrypto = false;
              break;
            }
          }
        }
      }

      // Custom Colors
      $("head").append(
        $("<style>", { id: "custom_color" }).text(`

            .alert .close span{
                color: ${storyCfg.theme.color4} !important;
            }
            
            .alert .close, .alert .close:hover{
                color: ${storyCfg.theme.color} !important;
            }
            
            
            .navbar-dark.bg-dark, #navTopPage {
                background-color: ${storyCfg.theme.primary} !important;
            }
            
            .navbar-dark .navbar-nav .nav-link {
                color: ${storyCfg.theme.color} !important;
            }
            
            .navbar-dark .navbar-nav .nav-link:hover {
                color: ${storyCfg.theme.color2} !important;
            }
            
            
            #sidebar {
                background: ${storyCfg.theme.secondary};
                color: ${storyCfg.theme.color3};
            }
            
            #sidebar .sidebar-header {
                background: ${storyCfg.theme.primary};
                color: ${storyCfg.theme.color};
            }
            
            #sidebar ul p {
                color: ${storyCfg.theme.color};
            }
            
            #sidebar ul li a:hover {
                color: ${storyCfg.theme.color};
                background: ${storyCfg.theme.primary};
            }
            
            #sidebar ul li.active > a, #sidebar a[aria-expanded="true"] {
                color: ${storyCfg.theme.color};
                background: ${storyCfg.theme.primary};
            }
            
            
            .tcat, #footer2{
                color: ${storyCfg.theme.color} !important;
                background-color: ${storyCfg.theme.secondary} !important;
            }
            
            .tcat, #footer2 a:hover{
                color: ${storyCfg.theme.color2} !important;
            }
            
            
            #footer, .modal.fade .modal-header, .thead, .page-footer, .comment-header{
                color: ${storyCfg.theme.color} !important;
                background-color: ${storyCfg.theme.primary} !important
            }
            
            .page-footer a:hover, .page-footer a:hover, #sidebar a {
                color: ${storyCfg.theme.color2} !important;
            }
            
            .thead a{
                color: ${storyCfg.theme.color} !important;
            }
            
            .thead a:hover{
                color: ${storyCfg.theme.color2} !important;
            }
            
            
            .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
                color: ${storyCfg.theme.color} !important;
                background-color: ${storyCfg.theme.primary} !important;
            }
            
            .nav-pills .show>.nav-link:hover {
                color: ${storyCfg.theme.color2} !important;
            }
            
            .page-footer a, #sidebar a {
                color: ${storyCfg.theme.color} !important;
            }
            
            
            
            
            
            .dropdown-item.active, .dropdown-item:active {
                color: ${storyCfg.theme.color};
                background-color: ${storyCfg.theme.secondary}; 
            }
            
            .nav-pills .nav-link.active,
            .nav-pills .show > .nav-link {
                color: ${storyCfg.theme.color};
                background-color: ${storyCfg.theme.secondary}; 
            }
            
            `),
      );

      // Readme
      storyData.readme = readme;

      // Read Me Disable
      let readButtonDisabled = "";
      if (storyCfg.underDevelopment) {
        readButtonDisabled = " d-none";
      }

      // Read Updater
      let isNewValue = "";
      storyData.globalIsNew = 0;
      for (const chapter in storyData.isNew) {
        if (
          storyData.isNew[chapter] === 2 &&
          storyData.isNew[chapter] > storyData.globalIsNew
        ) {
          storyData.globalIsNew = 2;
          isNewValue = $("<span>", { class: "badge badge-primary ms-2" }).text(
            "NEW",
          );
        } else if (
          storyData.isNew[chapter] === 1 &&
          storyData.isNew[chapter] > storyData.globalIsNew
        ) {
          storyData.globalIsNew = 1;
          isNewValue = $("<span>", {
            class: "badge badge-secondary ms-2",
          }).text("UPDATE");
        }
      }

      // Year
      const yearNow = moment().year();
      let copyrightText = null;
      if (yearNow === storyCfg.year) {
        copyrightText = `© ${storyCfg.year} ${storyCfg.title} | `;
      } else {
        copyrightText = `© ${storyCfg.year} - ${yearNow} ${storyCfg.title} | `;
      }

      // Insert Navbars
      const navbarItems = function () {
        // Base Crypto Modal
        const baseCryptoModal = function (crypto_value, title) {
          return function () {
            const qrcodeCanvas = $("<canvas>");
            qrcode.toCanvas(
              qrcodeCanvas[0],
              storyCfg[crypto_value].address,
              function (error) {
                if (error) {
                  alert(error);
                } else {
                  // Prepare Text
                  tinyLib.modal({
                    title: title + " Network Donation",

                    id: "busd_request",
                    dialog: "modal-lg",

                    body: $("<center>").append(
                      $("<h4>", { class: "mb-5" }).text(
                        "Please enter the address correctly! Any type issue will be permanent loss of your funds!",
                      ),
                      $("<a>", {
                        target: "_blank",
                        href:
                          storyCfg[crypto_value].explorer +
                          storyCfg[crypto_value].address,
                      }).text("Blockchain Explorer"),
                      $("<br>"),
                      $("<span>").text(storyCfg[crypto_value].address),
                      $("<div>", { class: "mt-3" }).append(qrcodeCanvas),
                    ),

                    footer: [],
                  });
                }
              },
            );

            // Complete
            return false;
          };
        };

        // Base
        const donationsItems = [];
        const tipsPages = [];

        // Derpibooru
        tipsPages.push({
          href: `https://derpibooru.org/tags/${storyCfg.derpibooru_tag}`,
          id: "derpibooru-page",
          text: "Derpibooru",
          icon: "fa-solid fa-paintbrush",
        });

        // Tantabus
        tipsPages.push({
          href: `https://tantabus.ai/tags/${storyCfg.derpibooru_tag}`,
          id: "tantabus-page",
          text: "Tantabus",
          icon: "fa-solid fa-paintbrush",
        });

        // Tiny Tips
        tipsPages.push({
          href: `javascript:void(0)`,
          id: "information-menu",
          text: "Museum",
          icon: "fa-solid fa-building-columns",
          click: () => openMDFile("pages/museum.md"),
        });

        tipsPages.push({
          href: `javascript:void(0)`,
          id: "tiny-ai-writer-tips",
          text: "AI Tips for human artists",
          icon: "fa-solid fa-circle-info",
          click: () => openMDFile("pages/artistTips.md"),
        });

        tipsPages.push({
          href: `javascript:void(0)`,
          id: "ai-fic-template",
          text: "Official AI Models",
          icon: "fa-solid fa-toolbox",
          click: () => openMDFile("pages/ai-templates/ai-models.md"),
        });

        // Patreon
        if (storyCfg.patreon) {
          donationsItems.push({
            href: `https://patreon.com/${storyCfg.patreon}`,
            id: "patreon-url",
            text: "Patreon",
            icon: "fa-brands fa-patreon",
          });
        }

        // Kofi
        if (storyCfg.kofi) {
          donationsItems.push({
            href: `https://ko-fi.com/${storyCfg.kofi}`,
            id: "kofi-url",
            text: "Ko-Fi",
            icon: "fa-solid fa-mug-hot",
          });
        }

        // Bitcoin
        if (
          storyCfg.bitcoin &&
          storyCfg.bitcoin.address &&
          storyCfg.bitcoin.explorer
        ) {
          donationsItems.push({
            href: storyCfg.bitcoin.explorer + storyCfg.bitcoin.address,
            id: "bitcoin-wallet",
            text: "Bitcoin",
            icon: "fa-brands fa-bitcoin",
            click: baseCryptoModal("bitcoin", "Bitcoin"),
          });
        }

        // Dogecoin
        if (
          storyCfg.dogecoin &&
          storyCfg.dogecoin.address &&
          storyCfg.dogecoin.explorer
        ) {
          donationsItems.push({
            href: storyCfg.dogecoin.explorer + storyCfg.dogecoin.address,
            id: "dogecoin-wallet",
            text: "Dogecoin",
            icon: "cf cf-doge",
            click: baseCryptoModal("dogecoin", "Dogecoin"),
          });
        }

        // Ethereum
        if (
          storyCfg.ethereum &&
          storyCfg.ethereum.address &&
          storyCfg.ethereum.explorer
        ) {
          donationsItems.push({
            href: storyCfg.ethereum.explorer + storyCfg.ethereum.address,
            id: "ethereum-wallet",
            text: "Ethereum",
            icon: "fa-brands fa-ethereum",
            click: baseCryptoModal("ethereum", "Ethereum"),
          });
        }

        // Polygon
        if (
          storyCfg.polygon &&
          storyCfg.polygon.address &&
          storyCfg.polygon.explorer
        ) {
          donationsItems.push({
            href: storyCfg.polygon.explorer + storyCfg.polygon.address,
            id: "polygon-wallet",
            text: "Polygon",
            icon: "cf cf-matic",
            click: baseCryptoModal("polygon", "Polygon"),
          });
        }

        // BNB
        if (storyCfg.bnb && storyCfg.bnb.address && storyCfg.bnb.explorer) {
          donationsItems.push({
            href: storyCfg.bnb.explorer + storyCfg.bnb.address,
            id: "bnb-wallet",
            text: "BNB",
            icon: "cf cf-bnb",
            click: baseCryptoModal("bnb", "BNB"),
          });
        }

        // Crypto Wallet
        if (storyCfg.nftDomain && storyCfg.nftDomain.url) {
          donationsItems.push({
            href: storyCfg.nftDomain.url.replace(
              "{domain}",
              storyCfg.nftDomain.domainWallet,
            ),
            id: "crypto-wallet",
            text: "More crypto wallets",
            icon: "fas fa-wallet",
          });
        }

        // Dropdown
        const addDropdown = (where) => {
          for (const item in where) {
            const aData = {
              class: "dropdown-item",
              href: where[item].href,
              id: where[item].id,
            };

            if (where[item].href && where[item].href !== "javascript:void(0)")
              aData.target = "_blank";

            const newHtml = $("<li>").prepend(
              $("<a>", aData)
                .text(where[item].text)
                .prepend($("<i>", { class: `${where[item].icon} me-2` })),
            );

            if (where[item].click) newHtml.on("click", where[item].click);

            where[item] = newHtml;
          }
        };

        addDropdown(donationsItems);
        addDropdown(tipsPages);

        // Meta Login
        const metaLogin = {
          base: $("<li>", { class: "nav-item font-weight-bold" }),
          title: "Login",
        };
        if (puddyWeb3.existAccounts()) {
          metaLogin.title = puddyWeb3.getAddress();
        }

        metaLogin.button = $("<a>", {
          id: "login",
          class: "nav-link",
          href: "#",
        })
          .attr("title", metaLogin.title)
          .prepend($("<i>", { class: "fa-brands fa-ethereum me-2" }));

        metaLogin.base.prepend(metaLogin.button);
        metaLogin.button.on("click", storyCfg.web3.login);

        // AI Login
        const aiLogin = {
          base: $("<li>", { class: "nav-item font-weight-bold" }),
        };
        tinyAiScript.setAiLogin(aiLogin);

        aiLogin.button = $("<a>", {
          id: "ai-login",
          class: "nav-link",
          href: "#",
        }).prepend($("<i>", { class: "fa-solid fa-robot me-2" }));

        tinyAiScript.checkTitle();
        aiLogin.base.prepend(aiLogin.button);
        aiLogin.button.on("click", function () {
          tinyAiScript.login(this);
          return false;
        });

        // Nav Items
        const newItem = [
          // Title
          $("<a>", { class: "navbar-brand d-none d-lg-block", href: "/" })
            .text(storyCfg.title)
            .on("click", () => {
              openMDFile("MAIN", true);
              return false;
            }),

          // Nav 1
          $("<ul>", { class: "navbar-nav me-auto mt-2 mt-lg-0 small" }).append(
            // Homepage
            $("<li>", { class: "nav-item" })
              .prepend(
                $("<a>", { class: "nav-link", href: "/", id: "homepage" })
                  .text("Home")
                  .prepend($("<i>", { class: "fas fa-home me-2" })),
              )
              .on("click", () => {
                openMDFile("MAIN", true);
                return false;
              }),

            // Discord Server
            $("<li>", { class: "nav-item" }).prepend(
              $("<a>", {
                class: "nav-link",
                target: "_blank",
                href: `https://discord.gg/${storyCfg.discordInvite}`,
                id: "discord-server",
              })
                .text("Discord")
                .prepend($("<i>", { class: "fab fa-discord me-2" })),
            ),

            // AI
            $("<li>", { class: "nav-item nav-ai" })
              .prepend(
                $("<a>", {
                  class: "nav-link",
                  href: "javascript:void(0)",
                  id: "ai-access-page",
                })
                  .text("AI Page")
                  .prepend($("<i>", { class: "fa-solid fa-server me-2" })),
              )
              .on("click", () => {
                tinyAiScript.open();
                return false;
              }),

            $("<li>", {
              class: "nav-item dropdown",
              id: "information-menu",
            }).prepend(
              $("<a>", {
                class: "nav-link dropdown-toggle",
                href: "#",
                role: "button",
                "data-bs-toggle": "dropdown",
                "aria-expanded": "false",
              }).text("Information"),

              $("<ul>", { class: "dropdown-menu" }).append(tipsPages),
            ),

            // Donations Button
            $("<li>", {
              class: "nav-item dropdown",
              id: "donations-menu",
            }).prepend(
              $("<a>", {
                class: "nav-link dropdown-toggle",
                href: "#",
                role: "button",
                "data-bs-toggle": "dropdown",
                "aria-expanded": "false",
              }).text("Donations"),

              $("<ul>", { class: "dropdown-menu" }).append(donationsItems),
            ),

            // Blog
            /* $('<li>', { class: 'nav-item nav-link', target: '_blank', href: storyCfg.blog_url, id: 'blog-url' }).text('Blog').prepend(
                            $('<i>', { class: 'fa-solid fa-rss me-2' })
                        ), */
          ),

          // Nav 2
          $("<ul>", {
            class: "nav navbar-nav ms-auto mb-2 mb-lg-0 small",
            id: "fic-nav",
          }).append(
            // Status Place
            $("<li>", { id: "status" }).css("display", "contents"),

            // Chapter Name
            $("<li>", { id: "fic-chapter", class: "nav-item nav-link" }),

            // Login
            aiLogin.base,
            metaLogin.base,

            // Read Fic
            $("<li>", {
              class: "nav-item font-weight-bold" + readButtonDisabled,
            })
              .prepend(
                $("<a>", {
                  id: "fic-start",
                  class: "nav-link",
                  href: "/?path=read-fic",
                })
                  .text("Read Fic")
                  .append(isNewValue)
                  .prepend($("<i>", { class: "fab fa-readme me-2" })),
              )
              .on("click", () => {
                if (!readButtonDisabled) {
                  $("#top_page").addClass("d-none");
                  openChapterMenu();
                }
                return false;
              }),
          ),
        ];

        aiLogin.button.tooltip();
        metaLogin.button.tooltip();
        return newItem;
      };

      // Insert Navbar
      $("body").prepend(
        // Navbar
        $("<nav>", {
          class: "navbar navbar-expand-lg navbar-dark bg-dark fixed-top",
          id: "md-navbar",
        }).append(
          // Title
          $("<a>", {
            class: "navbar-brand d-block d-lg-none ms-sm-4",
            href: "/",
          })
            .text(storyCfg.title)
            .on("click", () => {
              openMDFile("MAIN", true);
              return false;
            }),

          // Button
          $("<button>", {
            class: "navbar-toggler me-sm-4",
            type: "button",
            "data-bs-toggle": "collapse",
            "data-bs-target": "#mdMenu",
            "aria-controls": "#mdMenu",
            "aria-expanded": false,
          }).append($("<span>", { class: "navbar-toggler-icon" })),

          // Collapse
          $("<div>", {
            class: "collapse navbar-collapse",
            id: "mdMenu",
          }).append(navbarItems()),

          // OffCanvas
          $("<div>", {
            class: "offcanvas offcanvas-end d-lg-none",
            tabindex: -1,
            id: "offcanvasNavbar",
            "aria-labelledby": "offcanvasNavbarLabel",
          }).append(
            $("<div>", { class: "offcanvas-header" }).append(
              $("<h5>", {
                class: "offcanvas-title",
                id: "offcanvasNavbarLabel",
              }).text(storyCfg.title),
              $("<button>", {
                class: "btn-close",
                type: "button",
                "data-bs-dismiss": "offcanvas",
              }),

              $("<div>", {
                class: "offcanvas-body",
              }) /* .append(navbarItems()) */,
            ),
          ),
        ),
      );

      // Insert Readme
      $("#app").append(
        // Content
        $("<div>", { id: "markdown-read", class: "container" }),
      );

      // Footer Base
      const tinyFooter = { 1: [], 2: [] };

      // Footer 1

      // OpenSea
      if (storyCfg.opensea) {
        tinyFooter[1].push(
          $("<li>").append(
            $("<a>", {
              target: "_blank",
              href: `https://opensea.io/collection/${storyCfg.opensea}`,
            })
              .text("OpenSea")
              .prepend($("<i>", { class: "fab fa-ethereum me-2" })),
          ),
        );
      }

      // CID32
      if (storyData.cid32) {
        tinyFooter[1].push(
          $("<li>").append(
            $("<a>", { href: `https://${storyData.cid32}.ipfs.dweb.link/` })
              .text("IPFS " + storyCfg.nftDomain.name)
              .prepend($("<i>", { class: "fas fa-wifi me-2" })),
          ),
        );
      }

      // Mastodon
      if (storyCfg.mastodon) {
        tinyFooter[1].push(
          $("<li>").prepend(
            $("<a>", {
              rel: "me",
              target: "_blank",
              href: `https://${storyCfg.mastodon.domain}/@${storyCfg.mastodon.username}`,
            })
              .text("Mastodon")
              .prepend($("<i>", { class: "fa-brands fa-mastodon me-2" })),
          ),
        );
      }

      // Discord Invite
      if (storyCfg.discordInvite) {
        tinyFooter[1].push(
          $("<li>").append(
            $("<a>", {
              target: "_blank",
              href: `https://discord.gg/${storyCfg.discordInvite}`,
            })
              .text("Discord Server")
              .prepend($("<i>", { class: "fab fa-discord me-2" })),
          ),
        );
      }

      // Mirror
      if (
        (Array.isArray(storyCfg.mirror) &&
          storyCfg.mirror.indexOf(location.host) > -1) ||
        !Array.isArray(storyCfg.mirror) ||
        storyCfg.mirror.length < 1
      ) {
        tinyFooter[1].push(
          $("<li>").append(
            $("<a>", { target: "_blank", href: `https://${storyCfg.domain}` })
              .text("Website")
              .prepend($("<i>", { class: "fa-solid fa-pager me-2" })),
          ),
        );
      } else {
        tinyFooter[1].push(
          $("<li>").append(
            $("<a>", {
              target: "_blank",
              href: `https://${storyCfg.mirror[dice.roll() - 1]}`,
            })
              .text("Mirror")
              .prepend($("<i>", { class: "fa-solid fa-pager me-2" })),
          ),
        );
      }

      // Footer 2
      if (storyCfg.nftDomain) {
        tinyFooter[2].push(
          $("<li>").append(
            $("<a>", {
              target: "_blank",
              href: storyCfg.nftDomain.url.replace(
                "{domain}",
                storyCfg.nftDomain.valueURL,
              ),
            })
              .text(storyCfg.nftDomain.name)
              .prepend($("<i>", { class: "fas fa-marker me-2" })),
          ),
        );
      }

      if (storyCfg.github) {
        tinyFooter[2].push(
          $("<li>").append(
            $("<a>", {
              target: "_blank",
              href: `https://github.com/${storyCfg.github.account}/${storyCfg.github.repository}`,
            })
              .text("Github")
              .prepend($("<i>", { class: "fab fa-github me-2" })),
          ),
        );
      }

      tinyFooter[2].push(
        $("<li>").append(
          $("<a>", { target: "_blank", href: "mailto:" + storyCfg.contact })
            .text("Contact")
            .prepend($("<i>", { class: "fas fa-envelope me-2" })),
        ),
      );

      tinyFooter[2].push(
        $("<li>")
          .prepend(
            $("<a>", {
              href: "/?path=%2FLICENSE.md&title=License",
              href: "/?path=%2FLICENSE.md&title=License",
              id: "license",
            })
              .text("License")
              .prepend($("<i>", { class: "fas fa-copyright me-2" })),
          )
          .on("click", () => {
            openMDFile("/LICENSE.md");
            return false;
          }),
      );

      // Insert Footer
      $("body").append(
        $("<footer>", { class: "page-footer font-small pt-4 clearfix" }).append(
          // Base
          $("<div>", {
            class: "container-fluid text-center text-md-left",
          }).append(
            $("<div>", { class: "row" }).append(
              // Logo
              $("<div>", { class: "col-md-6 mt-md-0 mt-3" }).append(
                $("<center>").append(
                  $("<img>", { class: "img-fluid", src: "/img/logo.png" }),
                  $("<br/>"),
                ),
              ),

              // Links 1
              $("<div>", { class: "col-md-3 mb-md-0 mb-3" }).append(
                $("<h5>").text("Links"),
                $("<ul>", { class: "list-unstyled" }).append(tinyFooter[1]),
              ),

              // Links 2
              $("<div>", { class: "col-md-3 mb-md-0 mb-3" }).append(
                $("<h5>").text("Links"),
                $("<ul>", { class: "list-unstyled" }).append(tinyFooter[2]),
              ),
            ),
          ),

          // Copyright
          $("<div>", {
            id: "footer2",
            class: "footer-copyright text-center py-3 bg-secondary text-white",
          })
            .text(copyrightText)
            .append(
              $("<a>", { target: "_blank", href: storyCfg.creator_url }).text(
                storyCfg.creator,
              ),
              ".",
            ),
        ),
      );

      // Start Readme
      if (params.path === "read-fic") openChapterMenu(params);
      else if (params.path === "ai") tinyAiScript.open();
      else openNewAddress(params, true, true);

      // Complete
      if (storyCfg.underDevelopment) {
        $("#under-development").modal();
      }

      // Final part
      fn();

      // First Time
      if (!localStorage.getItem("firstTime")) {
        localStorage.setItem("firstTime", true);
        alert(
          `If this is the first time you enter the website, remember that to browse the website, use navbar at the top of the page. If you want to read the fic, go to the "Read Fic" page that is in the right corner of the navbar.

This same navbar will also show all the fic tools as "bookmark" and data progress of the story. Although we have an account system, you are not required to use. Please use only what you really find necessary to use.`,
          "Welcome to Pony Driland!",
        );
      }
    });
  };

  puddyWeb3.waitReadyProvider().then(startApp).catch(startApp);
});
