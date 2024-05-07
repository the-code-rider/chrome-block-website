document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['customMessage'], function(result) {
        if (result.customMessage && result.customMessage.trim() !== '') {
            document.getElementById('messageContainer').textContent = result.customMessage;
        }
    });
});
