(function (window, document, $) {
    'use strict';

    $(function () {
        Contact();

        $(window).load(function() {
            Navigation();
        });
    });

    function Navigation() {
        var elements = {};
        var sectionPositions = [];
        var $element = $('.js-navigation');
        var $logo = $('.logo img');
        var defaultLogo = $logo.attr('src');
        var $body = $('html, body');
        var length = 0;
        var currentElement = $element.find('a.active').attr('href');

        buildPositions();
        length = sectionPositions.length;

        onScroll();

        $(window).on('resize', buildPositions);
        $(document).on('scroll', onScroll);

        $(document).on('click', 'a.js-scrollable-link', function (e) {
            e.preventDefault();

            $body.stop();

            var id = this.getAttribute('href');

            $body.animate({
                scrollTop: elements[id].offsetTop
            }, 1000);
        });

        function buildPositions() {
            var neg = $element[0].offsetHeight;

            // reset values
            elements = {};
            sectionPositions = [];

            $(document).find('a.js-scrollable-link').each(function (i, el) {
                var $link = $(el);
                var id = $link.attr('href');
                var $el = $(id);
                var offsetTop = $el[0].offsetTop - neg;
                offsetTop = offsetTop < 0 ? 0 : offsetTop;

                elements[id] = {
                    $link: $link,
                    offsetTop: offsetTop
                };

                if (!$link.hasClass('js-menu-item')) {
                    return;
                }

                sectionPositions.push({
                    id: id,
                    position: offsetTop
                });
            });
        }

        function onScroll() {
            var current = Math.ceil(window.pageYOffset);

            if (current > 0 && !$element.hasClass('on-scroll')) {
                $element.addClass('on-scroll');
                $logo.attr('src', $logo.attr('data-on-scroll'));
            } else if (current <= 0 && $element.hasClass('on-scroll')) {
                $element.removeClass('on-scroll');
                $logo.attr('src', defaultLogo);
            }

            for (var i = 0; i < length; i++) {
                if (i+1 < length && current >= sectionPositions[i+1].position) {
                    continue;
                }

                var id = sectionPositions[i].id;

                if (currentElement === id) {
                    break;
                }

                elements[currentElement].$link.removeClass('active');
                elements[id].$link.addClass('active');
                currentElement = id;

                break;
            }
        }
    }

    function Contact() {
        var $element = $('.js-contact').first();
        var $messageContainer = $element.find('#form_message');

        $element.on('submit', function (event) {
            $messageContainer.html('');
            event.preventDefault();

            var $button = $element.find('button[type="submit"]');
            var currentValue = $button.text();
            $button.prop('disabled', true);
            $button.text('Envoi en cours...');

            var $form = $(this);

            $.ajax({
                url: 'contact.php',
                data: $form.serialize(),
                method: 'POST'
            }).success(function () {
                $form[0].reset();
                $button.text('Merci');
                var message = $('<div></div>').addClass('alert alert-success').text('Message envoyé');
                $messageContainer.html(message);
            }).fail(function (response) {
                var content = response.responseJSON;

                if (content.error) {
                    var message = $('<div></div>').addClass('alert alert-danger').text(content.error);
                    $messageContainer.html(message);
                }

                $button.text(currentValue);
                $button.prop('disabled', false);
            });
        });
    }
})(window, window.document, window.jQuery);

