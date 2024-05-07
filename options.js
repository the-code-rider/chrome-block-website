document.getElementById('addSite').addEventListener('click', function() {
  const site = document.getElementById('siteInput').value;
  chrome.storage.sync.get(['sites'], function(result) {
    let sites = result.sites || [];
    if (!sites.includes(site) && site.trim() !== '') {
      sites.push(site);
      chrome.storage.sync.set({sites: sites}, function() {
        updateRules(sites);
        console.log('Site added!');
      });
    }
  });
  document.getElementById('siteInput').value = '';  // Clear input after adding
});

document.getElementById('saveMessage').addEventListener('click', function() {
  const message = document.getElementById('messageInput').value;
  chrome.storage.sync.set({customMessage: message}, function() {
    console.log('Message saved!');
  });
});

function updateRules(sites) {
  chrome.declarativeNetRequest.getDynamicRules(rules => {
    const existingIds = rules.map(rule => rule.id);
    const newRules = sites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { 
                type: 'block',
                // redirect: {url: chrome.runtime.getURL('blocked.html')}
            },
      condition: { urlFilter: '*://*.' + site + '/*', resourceTypes: ['main_frame'] }
    }));
    console.log('new rules')
    console.log(newRules)

    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const updatedRules = newRules.map((rule, index) => ({
      ...rule,
      id: maxId + index + 1
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: updatedRules
    }, () => console.log('Rules updated'));
  });
}

function updateSiteList(sites) {
  const listElement = document.getElementById('blockedSitesList');
  listElement.innerHTML = '<h2>Blocked Sites:</h2>'; // Clear and add title
  sites.forEach((site, index) => {
    const siteItem = document.createElement('div');
    siteItem.className = 'site-item';
    siteItem.textContent = site;
    const removeBtn = document.createElement('span');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-site';
    removeBtn.onclick = () => removeSite(site);
    siteItem.appendChild(removeBtn);
    listElement.appendChild(siteItem);
  });
}

function removeSite(siteToRemove) {
  chrome.storage.sync.get(['sites'], function(result) {
    const updatedSites = result.sites.filter(site => site !== siteToRemove);
    chrome.storage.sync.set({sites: updatedSites}, function() {
      updateRules(updatedSites);
      updateSiteList(updatedSites);
      console.log('Site removed!');
    });
  });
}

// Load initial sites and custom message on options page load
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['sites', 'customMessage'], function(result) {
    document.getElementById('messageInput').value = result.customMessage || '';
    if (result.sites) {
      updateRules(result.sites);
      updateSiteList(result.sites)
    }
  });
});
