$(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
    const $page = $('.page');
    const scrollPadding = getScrollbarWidth();

    let $popup = null;

    $(document).on('click', '[data-popup-action]', (event) => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const action = $target.data('popup-action');

        switch (action) {
            case 'close':
                hidePopup();
                break;

            default:
                initPopup($target);
        }
    });

    $(document).on('keyup', (event) => {
        if (event.keyCode === 27) {
            hidePopup();
        }
    });

    function initPopup($target) {
        const popupID = $target.data('popup-action');
        showPopup(popupID);
    }

    function showPopup(popupID) {
        $popup = $(`[data-popup-id="${popupID}"]`);
        $popup.addClass('popup_visible');
        $page.addClass('page_fixed');

        if (!isIOS) {
            $page.css('padding-right', scrollPadding + 'px');
        }
    }

    function hidePopup() {
        $popup.removeClass('popup_visible');
        $page.removeClass('page_fixed');

        if (!isIOS) {
            $page.removeAttr('style');
        }
    }

    function getScrollbarWidth() {
        const innerWidth = window.innerWidth;
        const clientWidth = document.body.clientWidth;

        return innerWidth - clientWidth;
    }
});