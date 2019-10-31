function compareObjects(o, p) {
  var i,
    keysO = Object.keys(o).sort(),
    keysP = Object.keys(p).sort();
  if (keysO.length !== keysP.length) return false; //not the same nr of keys
  if (keysO.join("") !== keysP.join("")) return false; //different keys
  for (i = 0; i < keysO.length; ++i) {
    if (o[keysO[i]] instanceof Array) {
      if (!(p[keysO[i]] instanceof Array)) return false;
      //if (compareObjects(o[keysO[i]], p[keysO[i]] === false) return false
      //would work, too, and perhaps is a better fit, still, this is easy, too
      if (p[keysO[i]].sort().join("") !== o[keysO[i]].sort().join(""))
        return false;
    } else if (o[keysO[i]] instanceof Date) {
      if (!(p[keysO[i]] instanceof Date)) return false;
      if ("" + o[keysO[i]] !== "" + p[keysO[i]]) return false;
    } else if (o[keysO[i]] instanceof Function) {
      if (!(p[keysO[i]] instanceof Function)) return false;
      //ignore functions, or check them regardless?
    } else if (o[keysO[i]] instanceof Object) {
      if (!(p[keysO[i]] instanceof Object)) return false;
      if (o[keysO[i]] === o) {
        //self reference?
        if (p[keysO[i]] !== p) return false;
      } else if (compareObjects(o[keysO[i]], p[keysO[i]]) === false)
        return false; //WARNING: does not deal with circular refs other than ^^
    }
    if (o[keysO[i]] !== p[keysO[i]])
      //change !== to != for loose comparison
      return false; //not the same value
  }
  return true;
}

const speakerTemplateReducer = (acc, speaker) => {
  return `
    ${acc}

    <div class="speaker">
      <img class="speaker__photo" src="${speaker.photoURL}" />
      <div class="speaker__infos">
        <div class="speaker__name">${speaker.name}</div>
        ${
          speaker.company
            ? `<div class="speaker__company">${speaker.company}</div>`
            : ""
        }
      </div>
    </div>
  `;
};

const talkTemplateReducer = (acc, conf) => {
  const speakers = conf.speakers
    ? conf.speakers.reduce(speakerTemplateReducer, "")
    : "";

  return `
    ${acc}

    <div class="talk ${speakers ? "talk--with-speakers" : ""}">
      <div class="talk__title">${conf.title}</div>
      <div class="talk__room">${conf.startTime} - ${conf.room}</div>
      <div class="talk__level">${conf.level ? conf.level : ""}</div>
      ${
        conf.category
          ? `<div class="talk__category">${conf.category}</div>`
          : ""
      }

      <div class="speakers">${speakers}</div>
    </div>
  `;
};

let prevList = [];

const talkCurrentFilter = data => {
  const confToShow = data.filter(conf => {
    const now = new Date();

    const time = conf.startTime.split(":").map(Number);
    const duration = conf.duration;

    const initialDate = new Date();
    initialDate.setHours(time[0]);
    initialDate.setMinutes(time[1] - 15);
    initialDate.setSeconds(0);

    const finalDate = new Date();
    finalDate.setHours(time[0]);
    finalDate.setMinutes(time[1] + duration - 15);
    finalDate.setSeconds(0);

    if (initialDate <= now && finalDate > now) {
      return true;
    }

    return false;
  });

  if (JSON.stringify(prevList) !== JSON.stringify(confToShow)) {
    prevList = confToShow;
    const htmlAmphi = confToShow.reduce(talkTemplateReducer, "");

    document.getElementById("amphis").innerHTML = htmlAmphi;
  }
};

const sponsorTemplateReducer = (acc, sponsor) => {
  return `
    ${acc}
    <a class="sponsor__link" href="${sponsor.url}" title="${sponsor.title}" target="_blank">
      <img class="sponsor__image" src="${sponsor.image}" alt="${sponsor.title}" />
    </a>
  `;
};

const sponsorFilter = data => {
  const firstHalf = data.slice(0, data.length / 2);
  const secondHalf = data.slice(data.length / 2);

  document.getElementById("firstHalf").innerHTML = firstHalf.reduce(
    sponsorTemplateReducer,
    ""
  );

  document.getElementById("secondHalf").innerHTML = secondHalf.reduce(
    sponsorTemplateReducer,
    ""
  );
};

fetch("./schedule.json")
  .then(e => e.json())
  .then(data => {
    talkCurrentFilter(data);
    window.setInterval(() => talkCurrentFilter(data), 1000);
  });

fetch("./sponsors.json")
  .then(e => e.json())
  .then(sponsorFilter);
