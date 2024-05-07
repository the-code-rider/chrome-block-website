function updateRules(sites) {
  chrome.declarativeNetRequest.getDynamicRules(rules => {
  	sites = sites || []
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

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    updateRules(); // Set initial rules on installation
});

chrome.storage.onChanged.addListener(changes => {
    if (changes.sites) {
        updateRules(); // Update rules when sites are changed
    }
});

