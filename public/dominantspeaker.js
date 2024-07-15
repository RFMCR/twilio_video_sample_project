/**
 * Listen to changes in the dominant speaker and update your application.
 * @param {Room} room - The Room you just joined
 * @param {function} updateDominantSpeaker - Updates the app UI with the new dominant speaker
 * @returns {void}
 */
function setupDominantSpeakerUpdates(room, updateDominantSpeaker) {
    room.on('dominantSpeakerChanged', function(participant) {
      console.log('A new RemoteParticipant is now the dominant speaker:', participant);
      updateDominantSpeaker(participant);
    });
  }
  