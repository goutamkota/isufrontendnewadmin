localStorage.setItem("theme", '{"vibrant": "", "darkvibrant": "", "logopath": ""}');
(function() {
  document.addEventListener('DOMContentLoaded', function() {

    var img, results;
    // examples = document.querySelectorAll('.choosen-img');
     var img = document.querySelector('.choosen-img img');
     img.crossOrigin = true;
    results = [];
   // for (i = 0, len = examples.length; i < len; i++) {
    //  example = examples[i];
      img.setAttribute('src', img.getAttribute('data-src'));
      results.push(img.addEventListener('load', function(e) {
        var panel, vibrant;
        vibrant = new Vibrant(this);
        console.log('works');
        panel = e.target.parentElement;
        panel.style.backgroundColor = vibrant.VibrantSwatch.getHex();

        var c_vibrant = (vibrant.VibrantSwatch)?vibrant.VibrantSwatch.getHex() : "";
        var c_muted = (vibrant.MutedSwatch)?vibrant.MutedSwatch.getHex() : "";
        var c_darkvibrant = (vibrant.DarkVibrantSwatch)?vibrant.DarkVibrantSwatch.getHex() : "";
        var c_darkmuted = (vibrant.DarkMutedSwatch)?vibrant.DarkMutedSwatch.getHex() : "";
        var c_lightvibrant = (vibrant.LightVibrantSwatch)?vibrant.LightVibrantSwatch.getHex() : "";
        var c_lightmuted = (vibrant.LightMutedSwatch)?vibrant.LightMutedSwatch.getHex() : "";

        var themecolors = {"vibrant": c_vibrant, "muted": c_muted, "darkvibrant": c_darkvibrant, "darkmuted": c_darkmuted, "lightvibrant": c_lightvibrant, "lightmuted": c_lightmuted, "logopath": img.getAttribute('data-src')};
        localStorage.setItem("theme", JSON.stringify(themecolors));
        console.log("colors", themecolors);

      }));
    //}
    return results;
  });

}).call(this);

