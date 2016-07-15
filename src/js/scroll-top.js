$(() => {
    const $win = $(window);
    const $doc = $(document);
    const $scrollTopButton = $('.scroll-top__button');

    $win.on('scroll load', () => {
        const scrollBottom = $doc.height() - $win.height() - $win.scrollTop();

        if ($win.scrollTop() > 400) {
            $scrollTopButton.addClass('scroll-top__button_visible');
        } else {
            $scrollTopButton.removeClass('scroll-top__button_visible');
        }
    });

    $scrollTopButton.on('click', (event) => {
        event.preventDefault();

        $('.page').animate({
            scrollTop: 0
        }, 200);
    });
});