// JS plugins for HTML page go here
function pwdMatch(){
    var pwd = document.getElementById("password");
    var c_pwd = document.getElementById("confirm_password");

    if(c_pwd != pwd){
        alert("Password must match")
    }
}

const CALENDAR_DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const CALENDAR_EVENTS = [
    {
      name: 'Christmas',
      day: 'Tuesday',
      time: '12:00',
      modality: 'In-Person',
      location: 'Town-Square',
      url: '',
      attendees: 'Me',
    },
    {
      name: 'St. Patricks Day',
      day: 'Thursday',
      time: '3:00',
      modality: 'In-Person',
      location: 'Chipotle',
      url: '',
      attendees: 'You',
    },
  ];



let EVENT_MODAL;

function initializeContent()
{
    EVENT_MODAL = new bootstrap.Modal('#calendar')
    const calendarElement = document.getElementById("calendar")
    CALENDAR_DAYS.forEach(day =>
        {
            var card = document.createElement('div');
            card.className = 'col-sm m-1 bg-white rounded px-1 px-md-2';

            card.id = day.toLowerCase();

            calendarElement.appendChild(card);

            const title = document.createElement('div');
            title.className = 'h6 text-center position-relative py-2';
            title.innerHTML = day;

            card.appendChild(title)

            const addEventIcon = document.createElement('i'); // allows to add icons to the UI
            addEventIcon.className = 'bi bi-calendar-plus btn position-absolute translate-middle start-100  rounded p-0 btn-link';

            addEventIcon.setAttribute('onclick', `openEventModal({day: '${card.id}'})`);

            document.querySelector(".container").appendChild(card);

            title.appendChild(addEventIcon);

            const body = document.createElement('div');

            body.classList.add('event-container');

            card.appendChild(body);

            updateDOM();

        });
}

function updateLocationOptions()
{
    //updateDOM();
}

function updateDOM()
{
    const events = CALENDAR_EVENTS;
    events.forEach((event, id) => {
        let eventElement = document.querySelector(`#event-${id}`);
        if(eventElement === null)
        {
            eventElement = document.createElement('div');
            eventElement.classList = 'event row border rounded m-1 py-1';
            eventElement.id = `event-${id}`;
            const title = document.createElement('div');
            title.classList.add('col', 'event-title');
            eventElement.append(title);
        }
        else
        {
            eventElement.remove();
        }
        const title = eventElement.querySelector('div.event-title');
        title.innerHTML = event.name;
        //add tool tip
        eventElement.setAttribute("onclick", `openEventModal({id: ${id}})`);
        document
            .querySelector(`#${event.day} .event-container`)
            .appendChild(eventElement);


    });
    //updateToolTips();
}
