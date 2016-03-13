function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function cleanUrl(url) {
    return url && url.endsWith('/') ? url.substring(0, url.length - 1) : url;
}

function redirectToLogin(loginUrl, next) {
    var newUrl = next ? cleanUrl(loginUrl) + '/?next=' + next : loginUrl;
    window.location.replace(newUrl);
}


function showMessage(message) {
    var div = document.querySelector("#messages");
    div.textContent = message;
    $("#messages").show();
    setTimeout(function() {
        div.textContent = '';
    }, 5000);
}

function showErrors(errors) {
    var string = "";
    er = JSON.parse(errors);
    for (field in er) {
        for (error in er[field]) {
            fieldObj = er[field];
            for (el in fieldObj) {
                if (field != "__all__")
                    string += field + ": "
                string += fieldObj[el].message + "\n";
            }
        }
    }
    showMessage(string);
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});
