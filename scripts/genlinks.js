const genLinks = (docs) => {

  let res = '<ul>';
  for (let doc of docs) {
    res += '<li>';
    if (doc.file.endsWith('.pdf') || doc.file.endsWith('.mp3') || 
      doc.file.endsWith('.html')) {
      res += '<a href="' + "../" + doc.file + '">' + doc.title + '</a>';
      
      // Add icon to end of title, based on what kind of content this item is.
      if (doc.file.endsWith('.pdf')) {
        res += '&nbsp;<img class="resource-img" src=' + '../icons/book-open-solid.svg>';
      } else if (doc.file.endsWith('.mp3')) {
        res += '&nbsp;<img class="resource-img" src=' + '../icons/podcast-solid.svg>';
      } else if (doc.file.endsWith('.html')) {
        res += '&nbsp;<img class="resource-img" src=' + '../icons/external-link-alt-solid.svg>';
      }
    } else if (doc.file.endsWith('.webm')) {
      res += doc.title + '<br>';
      poster = doc.file.replace('webm','jpg')
      res += '<video src="../' + doc.file + '" controls="controls" preload="none" poster="../' + poster + '" controlsList="nodownload"></video>';
    }
    res += '<br>';
    res += '<small>by ' + doc.author + '</small>';
    
    if (doc.license !== '') {
      res += '<br><span class="license-text">' + doc.license + '</span>';
      //res += '<br><small><i>' + doc.license + '</i></small>';
    }
    res += '<br><small>' + doc.abstract + '</small>';
    res += '</li>';
  }
  res += '</ul>';

  return res;
}
