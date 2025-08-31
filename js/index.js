$(document).ready(function () {
    $('.seo-btn').on('click', function () {
        let seoContent = $('.seo-content');
        let seoBlock = $('.seo');
        let button = $(this);

        if (!seoContent.hasClass('bg')) {
            $('html, body')
                .stop(true)
                .animate(
                    {
                        scrollTop: seoBlock.offset().top - 120,
                    },
                    300
                );

            seoContent.addClass('bg');
            button.text('Развернуть');
        } else {
            seoContent.removeClass('bg');
            button.text('Скрыть');
        }
    });

    let flag = true;

    function setActiveCardImage() {
        const activeCard = $('.main-section__card.active');
        if (activeCard.length) {
            const image = activeCard.data('image');
            activeCard.css('background-image', `url('${image}')`);
        }
    }

    function toggleActiveOnClick() {
        if ($(window).width() > 480) {
            $('.main-section__card.toggle')
                .off('click')
                .on('click', function () {
                    $('.main-section__card.toggle')
                        .removeClass('active')
                        .css('background-image', 'none');
                    $(this)
                        .addClass('active')
                        .css('background-image', `url('${$(this).data('image')}')`);
                });
        } else {
            $('.main-section__card.toggle').off('click');
        }
    }

    function activateAllCards() {
        const cards = $('.main-section__card.toggle');
        const isMobile = $(window).width() < 481;

        cards.each(function (index) {
            if (isMobile || index === 1) {
                $(this)
                    .addClass('active')
                    .css('background-image', `url('${$(this).data('image')}')`);
            } else {
                $(this).removeClass('active').css('background-image', 'none');
            }
        });
    }

    function initializeSlickSlider() {
        const isMobile = $(window).width() < 481;
        const $cards = $('.main-section__cards');
        const $productCards = $('.product-cards');

        if (isMobile) {
            if (!$cards.hasClass('slick-initialized')) {
                $cards.slick({
                    dots: true,
                    speed: 300,
                    arrows: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    adaptiveHeight: true,
                    autoplay: true,
                    autoplaySpeed: 5000,
                });
            }
            if (!$productCards.hasClass('slick-initialized')) {
                $productCards.slick({
                    speed: 300,
                    arrows: false,
                    slidesToShow: 1.02,
                    slidesToScroll: 1,
                    infinite: true,
                    adaptiveHeight: true,
                });
            }
        } else {
            if ($cards.hasClass('slick-initialized')) {
                $cards.slick('unslick');
            }
            if ($productCards.hasClass('slick-initialized')) {
                $productCards.slick('unslick');
            }
        }
    }

    function countSlide() {
        const isMobile = $(window).width() < 480;
        const $cards = $('.main-section__card');
        const slideCount = isMobile ? $('.slick-dots li').length : 0;

        $cards.each(function () {
            const $numElement = $(this).find('.main-section__card-num b');

            if (isMobile) {
                $numElement.text(`/0${slideCount - 1}`);
            } else {
                $numElement.text('');
            }
        });
    }

    function lastGrid() {
        const width = $(window).width() >= 991 && $(window).width() <= 1355;
        let childsLength = $('.grid').children().length;
        if (width) {
            if (childsLength % 2 !== 0) {
                $('.grid-item:last-child').css('grid-column', 'span 2');
            }
        } else {
            $('.grid-item:last-child').css('grid-column', 'auto');
        }
    }

    function topFilters() {
        let breadcrumbsHeight = $('.breadcrumbs').outerHeight(true);
        let headerHeight = $('.header').outerHeight(true);
        let topFilters = breadcrumbsHeight + headerHeight;
        $('.filters-mob.active').css('top', topFilters);
    }
    function adjustMainHeight() {
        const windowHeight = $(window).height();
        const isDesktopView = window.innerWidth > 480;
        const $header = $('.header');
        const $main = $('.main');

        if (isDesktopView) {
            const headerBottom = $header.offset().top + $header.outerHeight();
            const distanceToBottom = windowHeight - headerBottom;

            $main.css('min-height', distanceToBottom);
        }
    }

    function init() {
        if (flag) {
            setActiveCardImage();
            flag = false;
        }
        toggleActiveOnClick();
        activateAllCards();
        initializeSlickSlider();
        countSlide();
        lastGrid();
        topFilters();
        adjustMainHeight();
    }

    init();

    $(window).resize(init);

    // Валидация формы
    const inputsReq = $('input[data-id="required"]');

    $('.form').on('submit', function (e) {
        let isValid = true;

        $(this)
            .find(inputsReq)
            .each(function () {
                if ($(this).val().trim() === '') {
                    e.preventDefault();
                    $(this).addClass('error');
                    isValid = false;
                }
            });

        return isValid;
    });

    function checkInputs() {
        inputsReq.on('input', function () {
            $(this).toggleClass('error', $(this).val().trim() === '');
        });
    }
    checkInputs();

    // FAQ
    $('.faq-item').on('click', function () {
        const content = $(this).find('.faq-answer');
        $('.faq-answer').not(content).slideUp().parent('.faq-item').removeClass('active');
        content.slideToggle('slow').parent('.faq-item').toggleClass('active');
    });

    if (innerWidth > 991) {
        $('.faq-inner .faq-item:nth-child(even)').on('click', function () {
            $('.faq-item').css('height', 'auto');
            $(this).prev().css('height', 'max-content');
        });

        $('.faq-inner .faq-item:nth-child(odd)').on('click', function () {
            $('.faq-item').css('height', 'auto');
            $(this).next().css('height', 'max-content');
        });
    }

    // Popular List
    $('.popular-list > a:nth-child(3n)').addClass('w-max');

    // Header Menu
    function setMinHeight(height) {
        $('.header-catalog__menu').css('min-height', height + 50);
    }

    function setMinHeight(height) {
        $('.header-catalog__menu').css('min-height', height + 50);
    }

    // $('.header-catalog__menu > ul > li > a').on('click', function () {
    //     const $submenu = $(this).next('nav'); // Получаем подменю
    //     const $submenuList = $submenu.find('ul'); // Получаем список подменю
    //     const height = $submenuList.height(); // Получаем высоту подменю

    //     // Если подменю активно, закрываем его
    //     if ($submenu.hasClass('active')) {
    //         $submenu.removeClass('active');
    //         $submenuList.slideUp(200); // Плавное закрытие подменю
    //         setMinHeight(0); // Сбрасываем минимальную высоту
    //     } else {
    //         // Закрываем все другие подменю
    //         $('.header-catalog__menu nav.active')
    //             .removeClass('active')
    //             .find('ul')
    //             .slideUp(200); // Плавное закрытие других подменю

    //         setMinHeight(height); // Устанавливаем новую минимальную высоту
    //         $submenu.addClass('active');
    //         $submenuList.show(); // Открываем подменю резко
    //     }
    // });

    // // Обработчик клика для кнопок в меню
    // $('.header-catalog__menu button').on('click', function (e) {
    //     e.stopPropagation(); // Предотвращаем всплытие события
    //     const $submenu = $(this).parent('nav'); // Получаем родительский nav

    //     // Закрываем подменю
    //     if ($submenu.length) {
    //         $submenu.removeClass('active').find('ul').slideUp(200); // Плавное закрытие подменю
    //         setMinHeight(0); // Сбрасываем минимальную высоту
    //     }
    // });

    // Mobile Header
    $('.header-mobile__button').on('click', function () {
        toggleSearch();
        toggleModal($(this));
        toggleOverflow();
        if ($('.filters-mob')) {
            $('.filters-mob').removeClass('active');
        }
    });

    function toggleSearch() {
        const searchElement = $('.header-mobile__search');
        if (searchElement.hasClass('active')) {
            searchElement.removeClass('active');
        } else {
            $('.background').toggleClass('active');
        }
    }

    function toggleModal(button) {
        const modal = $('.header-modal');
        button.toggleClass('close');
        modal.toggleClass('active');
    }

    function toggleOverflow() {
        if ($('.header-mobile__button').hasClass('close')) {
            $('html').css('overflow', 'hidden');
            $('body').css('overflow', 'hidden');
        } else {
            $('html').css('overflow-y', 'auto');
            $('body').css('overflow-y', 'auto');
        }
    }

    $('.header-catalog__button').on('click', function () {
        $('.background').toggleClass('active');
        $('.header-catalog__menu-inner').toggleClass('active');
    });

    $('[data-id="search"]').on('click', function () {
        if ($('.header-mobile__button').hasClass('close')) {
            $('.header-mobile__button').removeClass('close');
            $('.header-modal').removeClass('active');
        } else {
            $('.background').toggleClass('active');
        }

        if ($('.filters-mob')) {
            $('.filters-mob').removeClass('active');
        }

        $('.header-mobile__search').toggleClass('active');
        if ($('.header-mobile__search').hasClass('active')) {
            $('html').css('overflow', 'hidden');
            $('body').css('overflow', 'hidden');
        } else {
            $('html').css('overflow-y', 'auto');
            $('body').css('overflow-y', 'auto');
        }

        return false;
    });

    $('.background').on('click', function () {
        if ($('.header-mobile__button').hasClass('close')) {
            $('.header-mobile__button').removeClass('close');
            $('.header-modal').removeClass('active');
        }
        if ($('.header-mobile__search').hasClass('active')) {
            $('.header-mobile__search').removeClass('active');
        }
        $(this).removeClass('active');
        $('html').css('overflow-y', 'auto');
        $('body').css('overflow-y', 'auto');
    });

    $('.file-inner input[type="file"]').on('change', function () {
        var file = $(this).prop('files')[0];

        if (file) {
            $('.file-inner button').text(`Вы прикрепили файл: "${file.name}"`).addClass('active');
        } else {
            $('.file-inner button').text('Прикрепить файл').removeClass('active');
        }
    });

    //слайдер изображений в попапе
    let images_magnific = $('.images-magnific');
    if (images_magnific)
        images_magnific.each(function () {
            $(this).magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                },
            });
        });

    $('.certificates-list').slick({
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 1,
        adaptiveHeight: true,
        prevArrow: $('.slider-button-prev'),
        nextArrow: $('.slider-button-next'),
        responsive: [
            {
                breakpoint: 1254,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 546,
                settings: {
                    slidesToShow: 1.02,
                    infinite: true,
                    variableWidth: false,
                },
            },
        ],
    });

    $('.blog-cards-slider').slick({
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        adaptiveHeight: true,
        infinite: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        variableWidth: false,
        centerMode: false,
        focusOnSelect: false,
        arrows: false,
        responsive: [
            {
                breakpoint: 1148,
                settings: {
                    slidesToShow: 2.1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 546,
                settings: {
                    slidesToShow: 1.1,
                    slidesToScroll: 1,
                },
            },
        ],
    });

    $('.watch-slider').slick({
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        adaptiveHeight: true,
        prevArrow: $('.slider-buttons--square .slider-button-prev'),
        nextArrow: $('.slider-buttons--square .slider-button-next'),
        infinite: false,
        responsive: [
            {
                breakpoint: 1254,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1.02,
                    infinite: true,
                    variableWidth: false,
                },
            },
        ],
    });

    var timerChangeCounterValue;
    $('.minus, .plus').on('click', function () {
        const triggerOnChange = $(this).data('trigger') === 'Y';
        const isIncrement = $(this).hasClass('plus');
        const parent = $(this).parent('.count');
        const el = parent.find('.count-input');
        let currentValue = Number(el.text());
        const step = parseInt(el.data('ratio') ?? 1);
        let $buyBlock = $(this).closest('.buy_block');
        let $toCart = $buyBlock.find('.item-action .to_cart');

        let minValue = parseFloat(
            $toCart.data('min')
                ? $toCart.data('min')
                : $(this).data('min')
                ? $(this).data('min')
                : 0
        );

        if (minValue < step) {
            minValue = step;
        }

        let newValue = isIncrement ? currentValue + step : Math.max(0, currentValue - step);

        if (!isIncrement && parseFloat(minValue) > 0 && newValue < minValue) {
            newValue = 0;
        }

        if (newValue < minValue) {
            return;
        }

        el.text(newValue);

        if (triggerOnChange) {
            let itemAction = JItemAction.factory($toCart[0]);
            if (parseFloat(currentValue) === 0) {
                itemAction.state = false;
                itemAction.resetQuantity();

                BX.onCustomEvent('onCounterGoals', [
                    {
                        goal: itemAction.getStateGoalCode(false),
                        params: {
                            id: itemAction.node.getAttribute('data-id'),
                        },
                    },
                ]);

                if (typeof JNoticeSurface === 'function') {
                    JNoticeSurface.get().node.remove();
                }

                return itemAction.updateState();
            }

            itemAction.abortPrevRequest();
            timerChangeCounterValue = setTimeout(function () {
                itemAction.updateState();
                timerChangeCounterValue = false;
            }, 700);

            BX.onCustomEvent('onCounterProductAction', [
                {
                    type: 'change',
                    params: {
                        id: $(this),
                        value: currentValue,
                    },
                },
            ]);
        }
    });

    $('.slider-product').each(function () {
        $(this).slick({
            dots: true,
            speed: 300,
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            adaptiveHeight: true,
        });
    });

    $('.subcategory-more__open').on('click', function () {
        $('.subcategory-more__modal').hide();
        let parent = $(this).parent('.subcategory-more');
        parent.find('.subcategory-more__modal').show();
    });
    $('.subcategory-more__modal-close').on('click', function () {
        $(this).parent('.subcategory-more__modal').hide();
    });

    $('.filter-search input').on('input', function () {
        const query = $(this).val().toLowerCase();
        let found = false;

        const parentFilter = $(this).closest('.filter');

        parentFilter.find('.filter-item').each(function () {
            const labelText = $(this).find('label').text().toLowerCase();

            if (labelText.includes(query)) {
                $(this).show();
                found = true;
            } else {
                $(this).hide();
            }
        });

        if (!found) {
            if (parentFilter.find('.no-results').length === 0) {
                parentFilter
                    .find('.filter-container')
                    .append('<div class="no-results">Ничего не найдено</div>');
            }
        } else {
            parentFilter.find('.no-results').remove();
        }

        const scrollContainer = parentFilter.find('.filter-scroll');
        if (scrollContainer.height() < 321) {
            parentFilter.find('.mCSB_dragger').css('opacity', '0');
        } else {
            parentFilter.find('.mCSB_dragger').css('opacity', '1');
        }
    });

    $('.filter-button').on('click', function () {
        let parent = $(this).parent('.filter');
        let filterShow = parent.find('.filter-show');
        let filterScroll = parent.find('.filter-scroll');

        // Закрываем все открытые filter-show и очищаем их input
        $('.filter-show')
            .not(filterShow)
            .slideUp(function () {
                $(this).closest('.filter').find('.filter-search input').val('').trigger('input');
            });

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            filterShow.slideUp();
        } else {
            $('.filter-button').removeClass('active');
            $(this).addClass('active');
            filterShow.slideDown();
        }

        if (!filterShow.is(':visible')) {
            parent.find('.filter-search input').val('');
            parent.find('.filter-search input').trigger('input');
        }

        filterScroll.mCustomScrollbar('update');

        if (!filterScroll.hasClass('mCS_no_scrollbar')) {
            filterScroll.mCustomScrollbar({
                theme: 'dark-3',
                scrollInertia: 322,
            });
        }

        if (innerWidth > 1440) {
            if (filterScroll.height() < 322) {
                parent.find('.mCSB_dragger').css('opacity', '0');
            } else {
                parent.find('.mCSB_dragger').css('opacity', '1');
            }
        } else {
            if (filterScroll.height() < 250) {
                parent.find('.mCSB_dragger').css('opacity', '0');
            } else {
                parent.find('.mCSB_dragger').css('opacity', '1');
            }
        }
    });

    $('.filter-submit').on('click', function () {
        let parent = $(this).closest('.filter');
        let checkedItems = parent.find('.filter-item input:checked');
        let parentName = parent.find($('.filter-button span')).text();

        let selectedTexts = [];

        checkedItems.each(function () {
            let labelText = $(this).next('label').text();
            selectedTexts.push(labelText);
        });

        let existingFilter = $('.filters-selected').find(
            `.filters-select[data-filter="${parentName}"]`
        );

        if (selectedTexts.length > 0) {
            if (existingFilter.length > 0) {
                let existingLabels = existingFilter
                    .find('.filter-label')
                    .text()
                    .replace(`${parentName}: `, '')
                    .split(', ');

                selectedTexts.forEach(function (text) {
                    if (!existingLabels.includes(text)) {
                        existingLabels.push(text);
                    }
                });

                existingLabels = existingLabels.filter((label) => selectedTexts.includes(label));

                existingFilter
                    .find('.filter-label')
                    .text(`${parentName}: ${existingLabels.join(', ')}`);
            } else {
                // Если элемента нет, создаем новый
                $('.filters-selected').append(
                    `<div class="filters-select" data-filter="${parentName}">
                        <span class="filter-label">${parentName}: ${selectedTexts.join(', ')}</span>
                        <button type="button" class="filters-delete">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.27498 4.88057L11.1556 0L12.55 1.39444L7.66941 6.275L12.55 11.1555L11.1556 12.5499L6.27498 7.66943L1.39445 12.5499L0 11.1555L4.88055 6.275L0 1.39444L1.39445 0L6.27498 4.88057Z" fill="white" />
                            </svg>
                        </button>
                    </div>`
                );
            }

            $('.filters-show').css('display', 'flex');
        } else if (existingFilter.length > 0) {
            existingFilter.remove();
        }

        if ($('.filters-selected').children().length === 0) {
            $('.filters-show').css('display', 'none');
        }

        parent.find('.filter-show').slideToggle();

        let filterButton = parent.find('.filter-button');
        if (checkedItems.length > 0) {
            filterButton.addClass('check-filter-button');
        } else {
            filterButton.removeClass('check-filter-button');
        }

        $('.filter-button').removeClass('active');
    });

    $('.filters-selected').on('click', '.filters-delete', function () {
        $(this).closest('.filters-select').remove();
        toggleFiltersShow();
    });

    function handleFilterChange() {
        if (innerWidth < 768) {
            // Обработчик события change для input
            $('.filter-item input').on('change', function () {
                let parent = $(this).closest('.filter');
                let parentName = parent.find($('.filter-button span')).text();
                let existingFilter = $('.filters-selected').find(
                    `.filters-select[data-filter="${parentName}"]`
                );

                if (existingFilter.length > 0) {
                    let selectedTexts = existingFilter.find('.filter-label').text().split(', ');

                    // Если input снят с checked
                    if (!$(this).is(':checked')) {
                        let labelText = $(this).next('label').text(); // Получаем текст метки
                        // Удаление текста из массива
                        selectedTexts = selectedTexts.filter(
                            (text) => text.trim() !== labelText.trim()
                        );

                        // Обновляем filter-label
                        existingFilter.find('.filter-label').text(selectedTexts.join(', '));

                        // Если после удаления меток массив пустой, удаляем элемент
                        if (selectedTexts.length === 0) {
                            existingFilter.remove();
                        }
                    }
                }
            });
        }
    }

    handleFilterChange();

    $(window).on('resize', function () {
        handleFilterChange();
    });

    // $(document).on('click', '.filters-delete', function () {
    // let filterElement = $(this).closest('.filters-select');
    // let filterName = filterElement.data('filter');

    // let element = $(`.filter-button span:contains("${filterName}")`);
    // let elementButton = element.closest('.filter-button');
    // let elementParent = element.closest('.filter');

    // elementButton.removeClass('check-filter-button');

    // if (elementParent.length) {
    // elementParent
    // .find('.filter-item input[type="checkbox"]')
    // .prop('checked', false);
    // }

    // filterElement.remove();

    // toggleFiltersShow();
    // });

    $(document).on('click', '.filters-reset', function () {
        $('.filter-button').removeClass('check-filter-button');
        $('.filters-selected').empty();

        $('.filter-item input').prop('checked', false);

        $('.filters-show').hide();
    });

    function toggleFiltersShow() {
        if ($('.filters-selected').find('.filters-select').length === 0) {
            $('.filters-show').css('display', 'none');
        } else {
            $('.filters-show').css('display', 'flex');
        }
    }

    $('.filters-title').on('click', function () {
        let parent = $(this).parent('.filters-item');
        let filtersShow = parent.find('.filters-show');

        let isActive = $(this).hasClass('active');

        $('.filters-show')
            .not(filtersShow)
            .slideUp()
            .parent()
            .find('.filters-title')
            .removeClass('active');

        if (isActive) {
            $(this).removeClass('active');
            filtersShow.slideUp();
        } else {
            filtersShow.slideDown();
            $(this).addClass('active');
        }
    });

    $('.filter-item input').on('input', function () {
        let parent = $(this).closest('.filters-list');
        let childrens = parent.find('.filters-item');

        childrens.find('.filters-checked').empty();

        let hasCheckedInput = false;

        childrens.each(function () {
            let checkedInputs = $(this).find('input:checked');

            if (checkedInputs.length > 0) {
                hasCheckedInput = true;
                let labels = [];

                checkedInputs.each(function () {
                    let textLabel = $(this).next('label').text();
                    labels.push(textLabel);
                });

                $(this)
                    .closest('.filters-item')
                    .find('.filters-checked')
                    .append(`${labels.join(', ')}`);

                $(this).closest('.filters-item').find('.filters-details').css('display', 'flex');
            } else {
                $(this).closest('.filters-item').find('.filters-details').css('display', 'none');
            }
        });

        // if (hasCheckedInput) {
        // parent.find('.filters-buttons').css('display', 'grid');
        // } else {
        // parent.find('.filters-buttons').css('display', 'none');
        // }
    });

    $('.filters-drop').on('click', function () {
        let parentItem = $(this).closest('.filters-item');

        let checkedInputs = parentItem.find('input:checked');

        if (checkedInputs.length > 0) {
            checkedInputs.prop('checked', false);

            parentItem.find('.filters-checked').empty();

            parentItem.find('.filters-details').css('display', 'none');
        }

        updateFiltersButtons(parentItem);
    });

    $('.filters-drop').on('click', function () {
        let parentItem = $(this).closest('.filters-item');

        let checkedInputs = parentItem.find('input:checked');

        if (checkedInputs.length > 0) {
            checkedInputs.prop('checked', false);

            parentItem.find('.filters-checked').empty();

            parentItem.find('.filters-details').css('display', 'none');
        }

        updateFiltersButtons();
    });

    $('.filters-all-drop').on('click', function () {
        let checkedInputs = $('input:checked');

        if (checkedInputs.length > 0) {
            checkedInputs.prop('checked', false);

            $('.filters-checked').empty();

            $('.filters-details').css('display', 'none');

            $('.filters-show').css('display', 'none');
        }

        updateFiltersButtons();
    });

    function updateFiltersButtons() {
        let hasCheckedInput = $('input:checked').length > 0;

        if (hasCheckedInput) {
            $('.filters-buttons').css('display', 'grid');
        } else {
            $('.filters-buttons').css('display', 'none');
        }
    }

    $('.filters-button').on('click', function () {
        $('html, body').scrollTop(0);

        $('html').css('overflow-y', 'hidden');
        $('body').css('overflow-y', 'hidden');
        $('.filters-mob').addClass('active');
        topFilters();

        function getDistanceToBottomOfViewport($element) {
            const rect = $element[0].getBoundingClientRect();
            const viewportHeight = $(window).height();
            const distanceToBottom = viewportHeight - rect.top;
            return distanceToBottom;
        }

        const $myElement = $('.filters-list');
        const distance = getDistanceToBottomOfViewport($myElement);
        $myElement.css('max-height', distance);
    });

    $('.mob-title').on('click', function () {
        $('html').css('overflow-y', 'auto');
        $('body').css('overflow-y', 'auto');
        $('.filters-mob').removeClass('active');
    });
    $('.filters-all-submit').on('click', function () {
        $('html').css('overflow-y', 'auto');
        $('body').css('overflow-y', 'auto');
        $('.filters-mob').removeClass('active');
    });

    $(document).on('click', '.checked-all', function () {
        const $this = $(this);
        const $parent = $this.closest('.checked-products');
        const $inputs = $parent.find('input[type="checkbox"]');
        const isActive = $this.toggleClass('active').hasClass('active');

        $inputs.prop('checked', isActive);

        $('.checked-delete-all').toggleClass('active', isActive);
    });

    $('.checked-more__open').on('click', function () {
        $('.checked-more__modal').removeClass('active');
        let parent = $(this).parent('.checked-more');
        parent.find('.checked-more__modal').toggleClass('active');
    });

    $('.checked-more__modal-close').on('click', function () {
        let parent = $(this).parent('.checked-more__modal');
        parent.removeClass('active');
    });
    let scrollTimeout;

    $('.menu a').on('mouseenter', function () {
        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            $('.menu a').removeClass('active');
            $('[data-submenu]').removeClass('active');

            $(this).addClass('active');

            let specificSubmenu = $(this).data('menu');
            let $submenu = $(`[data-submenu="${specificSubmenu}"]`);

            $submenu.addClass('active');

            if ($submenu.length) {
                let $container = $('.submenu');
                let offsetTop = $submenu.position().top;
                let currentScroll = $container.scrollTop();
                let targetScroll = currentScroll + offsetTop;

                if (Math.abs(currentScroll - targetScroll) > 5) {
                    $container.stop(true).animate({ scrollTop: targetScroll }, 500);
                }
            }
        }, 100);
    });

    $('.submenu-item').first().addClass('active');
    $('.menu a').first().addClass('active');

    var headerHeight = $('.header-wrapper').outerHeight();
    var screenHeight = $(window).height();
    let catalogHeight = screenHeight - headerHeight;
    $('.header-catalog__menu').css('max-height', catalogHeight - 150);
    $('.menu').css('max-height', catalogHeight - 150);
    $('.submenu').css('max-height', catalogHeight - 150);

    //новый код
    $('.header-search input').on('input', function () {
        let searchTerm = $(this).val().toLowerCase();

        if (searchTerm.length > 0) {
            $('.header-search__container').addClass('active');
            $('.header-search__delete').show();
        } else {
            $('.header-search__container').removeClass('active');
            $('.header-search__delete').hide();
        }

        $('.header-search__list a').each(function () {
            let linkText = $(this).text().toLowerCase();
            if (linkText.includes(searchTerm) && searchTerm !== '') {
                let highlightedText = $(this)
                    .text()
                    .replace(new RegExp('(' + searchTerm + ')', 'gi'), '<strong>$1</strong>');
                $(this).html(highlightedText);
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    $('.mobile-search__input input').on('input', function () {
        let searchTerm = $(this).val().trim();
        let hasMatches = false;

        if (searchTerm.length > 0) {
            $('.mobile-search__result a').each(function () {
                let linkText = $(this).text();
                if (linkText.toLowerCase().includes(searchTerm.toLowerCase())) {
                    // Экранируем спецсимволы в поисковом термине
                    let escapedTerm = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    let highlightedText = linkText.replace(
                        new RegExp('(' + escapedTerm + ')', 'gi'),
                        '<strong>$1</strong>'
                    );
                    $(this).html(highlightedText);
                    $(this).show();
                    hasMatches = true;
                } else {
                    $(this).hide();
                }
            });

            if (hasMatches) {
                $('.mobile-search__result').show();
                $('.mobile-search__more').hide();
            } else {
                $('.mobile-search__result').hide();
                $('.mobile-search__more').show();
            }

            // Показываем кнопку сброса, если в инпуте есть хотя бы один символ
            $('.mobile-search__input-reset').show();
        } else {
            // Если инпут пустой — показываем "more", скрываем результаты и кнопку сброса
            $('.mobile-search__result').hide();
            $('.mobile-search__more').show();
            $('.mobile-search__input-reset').hide();

            // Восстанавливаем исходный текст и показываем все ссылки
            $('.mobile-search__result a').each(function () {
                let linkText = $(this).text();
                $(this).html(linkText);
                $(this).show();
            });
        }
    });

    $('.filters-search input').on('input', function () {
        let inputValue = $(this).val().trim();
        let hasMatches = false;

        $('.filters-search__container-list a').each(function () {
            let linkText = $(this).text();

            if (
                inputValue.length > 0 &&
                linkText.toLowerCase().includes(inputValue.toLowerCase())
            ) {
                // Экранируем спецсимволы в inputValue для RegExp
                let escapedInput = inputValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                let highlightedText = linkText.replace(
                    new RegExp('(' + escapedInput + ')', 'gi'),
                    '<strong>$1</strong>'
                );
                $(this).html(highlightedText);
                $(this).show();
                hasMatches = true;
            } else {
                // Восстанавливаем исходный текст без подсветки
                $(this).text(linkText);
                $(this).hide();
            }
        });

        // Показываем кнопку удаления, если в инпуте есть хотя бы один символ
        if (inputValue.length > 0) {
            $('.filters-search__delete').show();
        } else {
            $('.filters-search__delete').hide();
        }

        // Добавляем или убираем класс active в зависимости от наличия совпадений
        if (hasMatches) {
            $('.filters-search__container').addClass('active');
        } else {
            $('.filters-search__container').removeClass('active');
        }
    });

    $('[button-delete]').on('click', function () {
        let parentDelete = $(this).closest('[parent-delete]');
        let inputElement = parentDelete.find('input');
        inputElement.val('');
        $(this).hide();

        if ($(this).hasClass('mobile-search__input-reset')) {
            $('.mobile-search__more').show();
            $('.mobile-search__result').hide();
        }
        if ($(this).hasClass('header-search__delete')) {
            $('.header-search__container').removeClass('active');
        }

        if ($(this).hasClass('filters-search__delete')) {
            $('.filters-search__container').removeClass('active');
        }
    });
});
