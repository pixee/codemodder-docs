// HN is for some reason sending users to our site with double slash

!function() {
    if(document.location.pathname === '//') {
        document.location = '/'
    }
}()