// Start Web3
var puddyWeb3 = new PuddyWeb3('matic');

// Accounts Changed
puddyWeb3.on('accountsChanged', function (data) {

    // Get Address
    const address = puddyWeb3.getAddress();
    console.log('Web3 Connected', address, data);

});

// Network Changed
puddyWeb3.on('networkChanged', function (networkId) {
    console.log('Web3 Network Connected', networkId);
});

puddyWeb3.on('network', function (newNetwork, oldNetwork) {

    console.log('Web3 Network Connected', newNetwork);
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    /* if (oldNetwork) {
        window.location.reload();
    } else if(storyCfg.web3.chainId !== newNetwork.chainId) {
        puddyWeb3.requestAccounts();
        console.error('Invalid Web3 Network!');
    } */



});

// Connection Update
puddyWeb3.on('connectionUpdate', function () {

    // Get Address
    const address = puddyWeb3.getAddress();

    // Console
    console.log('Web3 Account', address);

    // Update CSS and remove modal
    $('#crypto_connection').modal('hide');
    $('body').addClass('web3-connected');

    // Change Title
    if (address) {

        $('#login').data('bs-tooltip-data', address);

        const tooltip = $('#login').data('bs-tooltip');
        if (tooltip) {
            tooltip.setContent({ '.tooltip-inner': address });
        }

    }

});

// Login
storyCfg.web3.login = function () {

    // Login Mode
    if (!puddyWeb3.existAccounts()) {
        tinyLib.modal({

            id: 'crypto_connection',
            title: 'Login Protocol (Features under development)',
            body: $('<center>').append(

                $('<button>', { class: 'btn btn-info m-4' }).text('Metamask').click(function () {

                    $('#crypto_connection').modal('hide');
                    puddyWeb3.alertIsEnabled();
                    if (puddyWeb3.isEnabled()) {
                        puddyWeb3.sign();
                    }

                })

            )

        });
    }

    // Panel
    else {

        // Prepare Items
        const modalTitle = 'Choose what kind of data you want to interact within the blockchain. Please make sure you are in the correct domain.';
        const modalWarn = $('<strong>', { class: 'ms-1' }).text('We only work on the domain ' + storyCfg.domain + '!');
        const items = [];
        const itemsData = {};
        let clickType = null;
        let clickType2 = null;

        // NSFW Filter
        itemsData.nsfwFilter = $('<button>', { class: 'btn btn-secondary m-2' }).text('NSFW Filters').click(function () {

            const filters = [];
            const nsfwList = [];
            for (const fic in storyData.data) {
                for (const item in storyData.data[fic]) {
                    if (storyData.data[fic][item].nsfw) {
                        for (const nsfwItem in storyData.data[fic][item].nsfw) {
                            if (nsfwList.indexOf(storyData.data[fic][item].nsfw[nsfwItem]) < 0) {

                                // Add Item
                                const NSFWITEM = storyData.data[fic][item].nsfw[nsfwItem];
                                nsfwList.push(NSFWITEM);

                                // Add NSFW Item
                                if (storyCfg.nsfw[NSFWITEM]) {

                                    // Action
                                    filters.push($('<button>', { class: 'btn btn-secondary m-2' }).data('nsfw_crypto_data', { id: NSFWITEM, data: storyCfg.nsfw[NSFWITEM] }).text(storyCfg.nsfw[NSFWITEM].name).click(function () {

                                        if (clickType === 'save') {

                                            let setValue = 0;
                                            const nsfwID = $(this).data('nsfw_crypto_data').id;
                                            if (typeof nsfwID === 'string' && nsfwID.length > 0) {

                                                const value = localStorage.getItem('NSFW' + nsfwID);
                                                if (value === 'true') {
                                                    setValue = 1;
                                                }

                                                puddyWeb3.executeContract(
                                                    storyCfg.web3.contract,
                                                    storyCfg.web3.abi.base,
                                                    'changeNsfwFilter(string,uint256)',
                                                    [nsfwID, setValue]
                                                );

                                            }

                                        } else if (clickType === 'load') {

                                        }

                                        $('#crypto_connection3').modal('hide');

                                    }));

                                }

                            }
                        }
                    }
                }
            }

            $('#crypto_connection2').modal('hide');
            tinyLib.modal({

                id: 'crypto_connection3',
                title: 'Blockchain Storage - ' + clickType2,
                dialog: 'modal-lg',
                body: $('<center>').append(
                    $('<div>').text('Choose which filter you want to interact with.'), filters
                )

            });

        });

        items.push(itemsData.nsfwFilter);

        // Volume
        itemsData.volume = $('<button>', { class: 'btn btn-secondary m-2' }).text('Volume').click(function () {

            if (clickType === 'save') {

                const volume = Number(localStorage.getItem('storyVolume'));

                if (typeof volume === 'number' && !isNaN(volume) && isFinite(volume) && volume >= 0 && volume <= 100) {
                    puddyWeb3.executeContract(
                        storyCfg.web3.contract,
                        storyCfg.web3.abi.base,
                        'setVolume(uint256)',
                        [volume]
                    );
                }

            } else if (clickType === 'load') {

            }

            $('#crypto_connection2').modal('hide');

        });

        items.push(itemsData.volume);

        // Chapter Selected
        if (storyData.chapter.selected > 0) {

            // Bookmark
            itemsData.bookmark = $('<button>', { class: 'btn btn-secondary m-2' }).text('Bookmark - Chapter ' + storyData.chapter.selected).click(function () {

                if (clickType === 'save') {

                    const setValue = Number(localStorage.getItem('bookmark' + String(storyData.chapter.selected)));

                    if (

                        typeof storyData.chapter.selected === 'number' &&
                        !isNaN(storyData.chapter.selected) && isFinite(storyData.chapter.selected) &&
                        storyData.chapter.selected > 0 &&

                        typeof setValue === 'number' &&
                        !isNaN(setValue) && isFinite(setValue) &&
                        setValue >= 0

                    ) {
                        puddyWeb3.executeContract(
                            storyCfg.web3.contract,
                            storyCfg.web3.abi.base,
                            'insertBookmark(uint256,uint256)',
                            [storyData.chapter.selected, setValue]
                        );
                    }

                } else if (clickType === 'load') {

                }

                $('#crypto_connection2').modal('hide');

            });

            items.push(itemsData.bookmark);

        }

        // The Modal
        tinyLib.modal({

            id: 'crypto_connection',
            title: 'Blockchain Storage',
            dialog: 'modal-lg',
            body: $('<center>').append(

                $('<div>').text('This is your cloud storage. Choose what you want to do. All your data is saved within the blockchain publicly. Any other user will be able to see your data saved.'),

                // Load
                $('<button>', { class: 'btn btn-secondary m-4' }).text('Load').click(function () {

                    clickType = 'load';
                    clickType2 = 'Load';
                    $('#crypto_connection').modal('hide');
                    tinyLib.modal({

                        id: 'crypto_connection2',
                        title: 'Blockchain Storage - ' + clickType2,
                        dialog: 'modal-lg',
                        body: $('<center>').append(
                            $('<div>').text(modalTitle).append(modalWarn), items
                        )

                    });

                }),

                // Save
                $('<button>', { class: 'btn btn-primary m-4' }).text('Save').click(function () {

                    clickType = 'save';
                    clickType2 = 'Save';
                    $('#crypto_connection').modal('hide');
                    tinyLib.modal({

                        id: 'crypto_connection2',
                        title: 'Blockchain Storage - ' + clickType2,
                        dialog: 'modal-lg',
                        body: $('<center>').append(
                            $('<div>').text(modalTitle).append(modalWarn), items
                        )

                    });

                })

            )

        });

    }

    return false;

};

// puddyWeb3.executeContract();