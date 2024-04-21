let arrowShowTimeoutId = null;

function openTab(event, tabName, currentButton) {
  hideArrow();

  let clickedOnActiveTab = false;

  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    // Also hide the parent
    tabcontent[i].parentElement.style.opacity = 0;
  }

  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    if (tablinks[i].style.backgroundColor !== "" && tablinks[i].id === currentButton.id) {
      clickedOnActiveTab = true;
    }

    tablinks[i].style.backgroundColor = "";
    tablinks[i].style.color = "#ffffff";
  }


  // Show the specific tab content
  const tab = document.getElementById(tabName);
  tab.style.display = "block";

  if (clickedOnActiveTab) {
    arrowShowTimeoutId = showArrowAfterTimeout();
    return;
  }

  tab.parentElement.style.opacity = 100;

  // Add the specific color to the button used to open the tab content
  currentButton.style.backgroundColor = "#ffffffdd";
  currentButton.style.color = "#000000";
}

function hideArrow() {
  if (arrowShowTimeoutId) {
    clearTimeout(arrowShowTimeoutId);
    arrowShowTimeoutId = null;
    return;
  }
  const arrowElement = document.querySelector("#arrow");
  arrowElement.style.opacity = 0;
}

function showArrow() {
  const arrowElement = document.querySelector("#arrow");
  arrowElement.style.opacity = 100;
  arrowShowTimeoutId = null;
}

function showArrowAfterTimeout() {
  return setTimeout(showArrow, 3_000);
}