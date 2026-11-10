/* Sign in, create account and reset pages. This prototype sends nothing: the button opens the matching page on dealgrade.co, where the account lives. */
(function(){
  /* PREVIEW marks the page as a review copy and locks the password boxes, so nobody types a real password into it.
     Set it to false when the pages go live on Dealgrade's own site and the form is wired to their sign-in. */
  var PREVIEW = true;
  if(PREVIEW){
    var strip = document.createElement('div');
    strip.className = 'pv-strip';
    strip.innerHTML = '<b>Design preview for the Dealgrade team.</b><span>This is not the live site, and nothing you type here is sent.</span>';
    document.body.insertBefore(strip, document.body.firstChild);
    Array.prototype.forEach.call(document.querySelectorAll('input[type=password]'), function(i){ i.readOnly = true; i.placeholder = 'Locked in this preview'; });
  }
  var form = document.getElementById('form'), why = document.getElementById('why');
  var NEXT = {
    sell: 'Sign in to list your home and talk to buyers directly.',
    distress: 'Sign in to see distress sales, each priced against Dealgrade\'s valuation.',
    listing: 'Sign in to open this home and message its owner.',
    project: 'Sign in to save this project and follow its grade.',
    matches: 'Sign in to see the buyers and sellers matched to you.'
  };
  var next = new URLSearchParams(location.search).get('next');
  if(why && NEXT[next]){ why.textContent = NEXT[next]; why.className = 'why'; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-show]'), function(b){
    b.addEventListener('click', function(){
      var i = document.getElementById(b.dataset.show), on = i.type === 'password';
      i.type = on ? 'text' : 'password'; b.textContent = on ? 'Hide' : 'Show';
    });
  });
  form.addEventListener('submit', function(e){ e.preventDefault(); location.href = form.dataset.go; });
})();
