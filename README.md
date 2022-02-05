![](https://github.com/JeeZeh/react-irish-rail/blob/master/src/android-chrome-512x512.png)

# React Rail - A modern Irish Rail timetable

Originally a personal learning project for React to load Irish Rail trains for a given station, React Rail has grown into a little more than that. See below for a summary of what it can do!

## Who is it for?

I think it is most valuable for someone who is familiar with the Irish Rail system/routes to a reasonable degree. If you know which trains you need to take but you just need to know when to take them, this is for you.

As a newcomer to the system it is a relatively noise-free display of train data that might be relevant to you if you find other apps a little too confusing.

## What does it do?

1. View the upcoming trains at any Irish Rail station for the next 2 hours
1. Explore the journey for each train approaching a station (see where it is in real time)
1. Filter the trains by reachable destination. This lets you figure out getting from one station to another i.e. you can only filter by directly connected stations
1. Save stations to your favourites for quick access in the future
1. Quickly access nearby station data if you provide location access
1. Bookmark/share your current station and lookahead time (trains in the next X mins) for future reference
1. Install the website as an app on mobile and desktop for quick access from the home screen etc.

## What does it NOT do?

- It does not perform route planning (get from A->B beyond a single train). I _may_ look into this in the future, but I don't want to be responsible for any missed trains!
- It does not show data from any other transport provider (e.g. Dublin Bus)

## How does it work?

The 'app' is comprised of 2 components

- A Node.js server acts as a simple proxy & cache to the [Irish Rail API](http://api.irishrail.ie/realtime/) as it does not support CORS.
- A user interface built with React to parse and display the API data.
