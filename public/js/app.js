navigator.serviceWorker.register('service-worker.js');

jQuery(document).ready(function ($) {

    var spinner = $(".loader");
    if (!location.origin)
        location.origin = location.protocol + "//" + location.host;
    var feedUrl = location.origin + "/feed/";
    var storyContainer = $(".story-cards");
    var articlesContainer = $('.articles');
    var selectedSection = "daily";
    var footer = $(".footer");

    var hashes = jQuery.param.fragment();

    if (hashes != "") {
        hashes = hashes.split("/");
        if (hashes[0] === "article") {
            if (hashes[1] === "categories") {
                getArticleContent(feedUrl + hashes[1] + "/" + hashes[2] + "/" + hashes[3]);
            } else {
                getArticleContent(feedUrl + hashes[1] + "/" + hashes[2]);
            }
        } else if (hashes[0] === "categories") {
            $('a.nav-item').removeClass('selected');
            $('a.nav-item[data-cat=' + hashes[2] + ']').addClass('selected');
            selectedSection = hashes[1];
            getCategoryContent(feedUrl + hashes[0] + "/" + hashes[1]);
        } else {
            $('a.nav-item').removeClass('selected');
            $('a.nav-item[data-cat=' + hashes[0] + ']').addClass('selected');
            selectedSection = hashes[0];
            getSectionContent(feedUrl + hashes[0]);
        }
    } else {
        $('a.nav-item').removeClass('selected');
        $('a.nav-item[data-cat=' + selectedSection + ']').addClass('selected');
        getSectionContent(feedUrl + selectedSection);
    }

    $('a.nav-item').on('click', function (e) {
        e.preventDefault();
        $('a.nav-item').removeClass('selected');
        $(this).addClass('selected');
        footer.attr('hidden', true);
        storyContainer.html("");
        articlesContainer.hide();
        articlesContainer.html("");
        selectedSection = $(this).data('cat');
        window.history.pushState("", "Categories", "/#" + selectedSection);
        spinner.show();
        getSectionContent(feedUrl + selectedSection);
    });

    function renderArticlesCard(_data) {
        if (_data.body.categories[0].features.length > 0) {
            $('body').removeClass('.article-mode');
            var articles = _data.body.categories[0].features;
            for (i = 0; i < articles.length; i++) {

                var cardTemplate = $(".cardTemplate").clone();
                cardTemplate = cardTemplate.removeClass('cardTemplate').removeAttr('hidden');

                var title = articles[i].head.text;
                var image = articles[i].image.uris.standard.thumbnail;
                var description = articles[i].sell.text;
                var id = articles[i].id;

                var fields = articles[i].fields;

                $(cardTemplate[0]).attr('data-id', id);

                cardTemplate.find('.story-image').append('<img src="' + image + '"/>')
                cardTemplate.find('.story-body h3').append(title);
                cardTemplate.find('.story-body p').append(description);
                storyContainer.append(cardTemplate);

                storyContainer.show();
                footer.removeAttr('hidden');
            }

            $('.card').on('click', function (e) {
                var id = $(this).data('id');
                var _url = feedUrl  + selectedSection + "/" + id;
                storyContainer.hide();
                footer.attr('hidden', true);
                spinner.show();
                window.history.pushState("", "Article", "/#article/" + selectedSection + "/" + id);
                getArticleContent(_url);
            });
        };
    }

    function renderSection(_data) {

        if (_data.body.issues) {
            _data = _data.body.issues[0];
        } else if (_data.body.series) {
            _data = _data.body.series[0]
        } else if (_data.body.categories) {
            _data = _data.body.categories[0]
        }

        if (_data.features.length > 0) {
            $('body').removeClass('.article-mode');
            var articles = _data.features;
            for (i = 0; i < articles.length; i++) {

                var cardTemplate = $(".cardTemplate").clone();
                cardTemplate = cardTemplate.removeClass('cardTemplate').removeAttr('hidden');

                var title = articles[i].head.text;
                var image = articles[i].image.uris.standard.thumbnail;
                var description = articles[i].sell.text;
                var id = articles[i].id;

                var fields = articles[i].fields;

                $(cardTemplate[0]).attr('data-id', id);

                cardTemplate.find('.story-image').append('<img src="' + image + '"/>')
                cardTemplate.find('.story-body h3').append(title);
                cardTemplate.find('.story-body p').append(description);
                storyContainer.append(cardTemplate);

                storyContainer.show();
                footer.removeAttr('hidden');
            }

            $('.card').on('click', function (e) {
                var id = $(this).data('id');
                
                storyContainer.hide();
                spinner.show();
                var articleRoot = "categories/" + selectedSection;
                footer.attr('hidden', true);
                if (selectedSection.indexOf("categories") > -1) {
                    articleRoot = selectedSection
                }

                var _url = feedUrl + articleRoot + "/" + id;
                window.history.pushState("", "Article", "/#article/"+articleRoot + "/" + id);
                getArticleContent(_url);
            });
        };
    }

    function getArticleContent(_url) {
        $.ajax({
            url: _url,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if (!jQuery.isEmptyObject(data)) {
                    renderArticle(data);
                }
            }
        });
    }

    function getCategoryContent(_url) {
        $.ajax({
            url: _url,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                spinner.hide();
                if (!jQuery.isEmptyObject(data)) {
                    renderArticlesCard(data);
                }
            }
        });
    }

    function getSectionContent(_url) {
        $.ajax({
            url: _url,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                spinner.hide();
                if (!jQuery.isEmptyObject(data)) {
                    renderSection(data);
                }
            }
        });
    }

    function renderArticle(_data) {
        var article = _data.body;
        articlesContainer.html("");
        var articleTemplate = $(".article-view").clone();
        articleTemplate = articleTemplate.removeAttr('hidden');

        var title = article.head.text;
        var image = article.image.uris.standard.full;
        var description = article.sell.text;
        var id = article.id;
        var fields = article.fields;

        var body = "";
        var credits = ""

        for (x = 0; x < fields.length; x++) {
            var type = fields[x].type;
            if (type === "BODY_COPY") {
                body += '<p>' + htmlDecode(fields[x].payload.body) + '</p>'
            }
            if (type === "TITLE_CREDIT") {
                credits += '<i class="line">' + fields[x].payload[0].role + ": " + fields[x].payload[0].person + '</i><br/>'
            }
        }

        articleTemplate.find('.headline').append(title);
        articleTemplate.find('.article-sell p').append(description);
        articleTemplate.find('.article-image').append('<figure><img src="' + image + '"/></figure>');
        articleTemplate.find('.credits').append(credits);
        articleTemplate.find('.article-body').append(body);

        articlesContainer.append(articleTemplate);

        articlesContainer.show();
        $('body').addClass('article-mode');
        spinner.hide();
        footer.removeAttr('hidden');
    }

    function htmlDecode(input) {
        var paragraph = ""; 

        if (input !== "") {
            var e = document.createElement('div');
            e.innerHTML = input;
            paragraph = e.childNodes[0].nodeValue
        }

        return paragraph;
    }


});