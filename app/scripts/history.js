// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const kMillisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const kOneWeekAgo = (new Date).getTime() - kMillisecondsPerWeek;
let history = $('#history');
const kColors = ['#4688F1', '#E8453C', '#F9BB2D', '#3AA757'];
let totalBytes = 0

function constructHistory(historyItems) {
  var $template = $('#historyTemplate');
  // var node = $template.prop('content');
  for (let item of historyItems) {
    let content = $template.prop('content');
    getPageSize(item.url, content, item);
  }
}

chrome.history.search({
      text: '',
      // startTime: 0,
      maxResults: 1000
    }, constructHistory);

$('searchSubmit').onclick = function() {
  historyDiv.innerHTML = " "
  let searchQuery = document.getElementById('searchInput').value
  chrome.history.search({
        text: searchQuery,
        startTime: kOneWeekAgo
      }, constructHistory)
}

$('deleteSelected').onclick = function() {
  let checkboxes = document.getElementsByTagName('input');
  for (var i =0; i<checkboxes.length; i++) {
    if (checkboxes[i].checked == true) {
        chrome.history.deleteUrl({url: checkboxes[i].value})
    }
  }
  location.reload();
}

$('removeAll').onclick = function() {
  chrome.history.deleteAll(function() {
    location.reload();
  });
}

$('seeAll').onclick = function() {
  location.reload();
}

var API_URL = 'https://www.googleapis.com/pagespeedonline/v4/runPagespeed?';

var API_KEY = 'AIzaSyDz_a-Pt7zadnMecsnqobQdvxlr5B7d3Vo';

// TODO: Build indexer that will make the request below and store in a hash map by domain => bytes
// Invokes the PageSpeed Insights API. The response will contain
// JavaScript that invokes our callback with the PageSpeed results.
function getPageSize(url, content, item) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // innerText does not let the attacker inject HTML elements.
      let length = 0.0000000002 * (parseInt(xhr.getResponseHeader('Content-Length'))) * 2204.62;
      if(length > 0) {
        totalBytes += length * item.visitCount;
        $("#carbon-score").html( Math.round(totalBytes) + " lb");
        var dollar_amount = (totalBytes / 2204.62).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        $(".dollar-amount").html( "$" + dollar_amount )
        let favicon_img = document.createElement('img');
	    let host = new URL(item.url).host;
	    
	    favicon_img.src = 'chrome://favicon/' + item.url;
	    
	    // content.querySelector(".request").appendChild(favicon_img);
	    content.querySelector(".request").innerHTML = "<a href="+item.url+">"+host+"</a>";
	    content.querySelector(".domain").innerHTML = "<span>"+item.title+"</span>";
	    content.querySelector(".count").innerHTML = "<span>"+item.visitCount+"</span>";
        content.querySelector('.score').innerText = length * item.visitCount + " lb";

        var clone = $(content).clone();
        // clone.querySelector('.removeButton, button')
        //   .addEventListener('click', function() {
        //     chrome.history.deleteUrl({url: item.url}, function() {
        //       location.reload();
        //     });
        //   });
        history.append(clone);
      }
    }
  }
  xhr.send();

}
