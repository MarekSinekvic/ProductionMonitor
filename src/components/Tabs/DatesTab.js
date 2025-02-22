import {  InfoIcon } from "@chakra-ui/icons";
import { Button, Checkbox, Divider, Flex, Popover, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Portal, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { placeArrayUnq, removeArrayUnq } from "../GeneralElements";

import redStripes from '../../icons/red_stripes.jpg';
import blueStripes from '../../icons/blue_stripes.jpg';
import greenStripes from '../../icons/green_stripes.jpg';
import yellowStripes from '../../icons/yellow_stripes.jpg';
import purpleStripes from '../../icons/purple_stripes.jpg';
import { BsHammer } from "react-icons/bs";
import { TiSpanner } from "react-icons/ti";
import { FaTruck } from "react-icons/fa";
import { BiNotepad } from "react-icons/bi";

function Event(time, type, duration = 0, description = ()=>{}, target = '', color = 'red') { // type = point | duration
    return {
        time : time, // time : [0, 24*60 = 1440]
        type : type,
        duration : duration, // duration : [...] = time

        target : target,
        description : description,

        color : color
    };
}
function TimeDivider() {
    let TimesElements = ()=>{
        let times = [];
        for (let i = 0; i < 24; i++) {
            times.push((
                <Flex key={i} direction={'column'} alignItems={'left'} position={'absolute'} left={(i/24*100)+"%"} w={1/24*100+"%"}>
                    <Flex fontSize={'12px'} justifyContent={'center'}>{i.toString().padStart(2,'0')}:00</Flex>
                    <Flex marginTop={'5px'} backgroundColor={'black'} w={'100%'} h={'0.8px'}></Flex>
                    <Flex backgroundColor={'black'} w={'0.8px'} h={'5px'}></Flex>
                </Flex>
            ));
        }
        return times;
    };
    return (
        <Flex w={"100%"} h={'40px'} position={'relative'} justifyContent={'space-between'} marginTop={1}>
            {TimesElements()}
        </Flex>
    );
}
function EventsMarking({events = [], yOffsets = []}) {
    // find time overlaps
    let EventMark = ({time,description = ''}) => {
        let timeUV = time / 1440;
        return (
            <Flex direction={'column'} alignItems={'center'} position={'absolute'} left={`calc(${(timeUV*100)+"%"} + 0px)`} w={0}>
                <Flex w={'0.8px'} h={'10px'} backgroundColor={'black'}></Flex>
                {/* <Flex w={'10px'} h={'10px'} border={'1px solid black'} borderRadius={'50%'}></Flex> */}
                <Text fontSize={'12px'} w={'max-content'}>{Math.floor(time/60).toString().padStart(2,'0')}:{Math.round(time/60%1*60).toString().padStart(2,'0')}</Text>
                <Text fontSize={'8px'} w={'max-content'}>{description}</Text>
            </Flex>
        );//{Math.floor(time/60)} : {Math.round((time/60%1)*60)}
    }
    let EventDuratedMark = ({event,yOffset = 0}) => {
        let timeUV = event.time / 1440;
        let durationUV = event.duration / 1440;
        const stripes = ()=>{
            if (event.color == 'blue') return blueStripes;
            if (event.color == 'green') return greenStripes;
            if (event.color == 'yellow') return yellowStripes;
            if (event.color == 'purple') return purpleStripes;
            return redStripes;
        };
        return (
            <Flex position={'absolute'} left={(timeUV*100)+"%"} top={(yOffset)+'px'} w={`calc(${(durationUV*100)+"%"} - 1px)`} gap={1}>
                <Flex w={0} alignItems={'center'} direction={'column'} position={'absolute'} left={'0%'} top={(-yOffset)+'px'}>
                    <Flex w={'0px'} h={(10+yOffset)+'px'} borderRight={'1px dotted rgba(0,0,0,0.3)'}></Flex>
                    <Flex fontSize={10}>{event.time > 0 ? `${Math.floor(event.time/60).toString().padStart(2,'0')}:${Math.round((event.time/60)%1*60).toString().padStart(2,'0')}` : ''}</Flex>
                </Flex>
                <Popover boundary={''}>
                    <PopoverTrigger><Flex w={'100%'} h={'10px'} bgImage={stripes} bgRepeat={"repeat"} bgSize={'200px'}></Flex></PopoverTrigger>
                    <Portal>
                        <PopoverContent><PopoverBody>
                            <Flex>
                                {event.description()}
                            </Flex>
                        </PopoverBody></PopoverContent>
                    </Portal>
                </Popover>
                <Flex w={0} alignItems={'center'} direction={'column'} position={'absolute'} left={'100%'} top={(-yOffset)+'px'}>
                    <Flex w={'0px'} h={(10+yOffset)+'px'} borderLeft={'1px dotted rgba(0,0,0,0.3)'}></Flex>
                    <Flex fontSize={10}>{event.time+event.duration < 1440 ? `${(Math.floor(event.time/60)+Math.floor(event.duration/60)).toString().padStart(2,'0')}:${(Math.round((event.time/60)%1*60)+Math.round((event.duration/60)%1*60)).toString().padStart(2,'0')}` : ''}</Flex>
                </Flex>
            </Flex>
        );
    }
    // console.log(yOffsets);
    
    
    return (
        <Flex direction={'row'} w={'100%'} position={'relative'}>
            {events.map((e,i)=>{
                if (e.type == 'point') {
                    return <EventMark key={i} time={e.time} description={e.description}/>;
                } else if (e.type == 'duration') {
                    let offset = 0;
                    if (yOffsets.length == events.length) offset = yOffsets[i];
                    return <EventDuratedMark key={i} event={e} yOffset={offset}/>
                }
            })}
        </Flex>
    );
}
function sigma(x) {
    return (Math.pow(Math.E,x)-1)/(Math.pow(Math.E,x)+1);
    //return 1/(1+Math.pow(Math.E,-x));
}
function TargetDatePicker({targetDate,targetSetter,targetTables = []}) {
    const [heatMap, setHeatMap] = useState([]);
    useEffect(()=>{
        (async ()=>{
            let heatList = [];
            for (let i = 0; i < new Date(targetDate[0],targetDate[1],0).getDate(); i++) {
                heatList.push(0);
            }
            let sqlDate = `${targetDate[0]}-${(targetDate[1]).toString().padStart(2,'0')}-%`;
            let ordersDates = [], logisticsDates =[],technicsProfilactics=[],productionDates=[];
            if (targetTables.includes('orders'))
                ordersDates = await window.DB.getGeneralRaw(`select date from trades where date like '${sqlDate}'`);
            if (targetTables.includes('logistics')) {
                logisticsDates = await window.DB.getGeneralRaw(`select shipment_date as start, unloading_date as end from logistics where shipment_date like '${sqlDate}' or unloading_date like '${sqlDate}'`);
            } if (targetTables.includes('technics'))
                technicsProfilactics = await window.DB.getGeneralRaw(`select profilactics_date as date from technics where (profilactics_date) like '${sqlDate}'`);
            if (targetTables.includes('production'))
                productionDates = await window.DB.getGeneralRaw(`select date as start,deadline_date as end from production where date like '${sqlDate}' or deadline_date like '${sqlDate}'`);

            let data = [...logisticsDates.filter((date,i)=>{return date.end === null}), ...technicsProfilactics, ...productionDates.filter((date,i)=>{return date.end !== null})];
            let duratedData = [...productionDates.filter((date,i)=>{return date.end !== null}), ...logisticsDates.filter((date,i)=>{return date.end !== null})];
            for (let i = 0; i < data.length; i++) {
                let day = new Date(data[i].date).getDate()-1;
                heatList[Math.floor(day)]++;
            }
            for (let i = 0; i < duratedData.length; i++) {
                const target = duratedData[i];
                // TODO heat transfer on other months
                if (target.start.getMonth() == target.end.getMonth()) {
                    const startDay = target.start.getDate()-1;
                    const endDay = target.end.getDate();
                    for (let j = startDay; j < endDay; j++) {
                        heatList[j]++;
                    }
                }

            }
            setHeatMap(heatList);
        })();
    },[targetDate,targetTables]);

    let days = [];
    let currDate = new Date();
    for (let i = 0; i < new Date(targetDate[0],targetDate[1],0).getDate(); i++) {
        let targetColor;
        if (i+1 == currDate.getDate() && currDate.getMonth()+1 == targetDate[1]) targetColor = 'rgba(0,0,255,0.1)';
        targetColor = (i+1==targetDate[2]) ? 'rgba(0,0,0,0.1)' : targetColor;
        let height = 0;
        if (typeof (heatMap[i]) != 'undefined') height = heatMap[i]*0.2;
        days.push(
            (<Flex key={i} style={{position:'relative'}} backgroundColor={targetColor} w={'100%'} justifyContent={'center'} onClick={(e)=>{targetSetter([targetDate[0],targetDate[1],i+1]);}} cursor={'pointer'}>
                <Flex style={{position: 'absolute', width: '100%', height: `${sigma(height)*100}%`, backgroundColor: 'rgba(255,0,0,0.3)'}}></Flex>
                <Flex>{i+1}</Flex>
            </Flex>)
        );
    }//<Input size={'sm'} w={'200px'} type="date" onChange={(e)=>{targetSetter(new Date(e.target.value));}}/>
    return (
        <Flex direction={'row'}>
            <Flex direction={'row'} w={'100px'}>{targetDate[0]}-{targetDate[1]}-{targetDate[2]}</Flex>
            <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'} w={'100%'}>
                <Flex cursor={'default'} onClick={()=>{targetSetter([targetDate[0],targetDate[1]-1,1])}}>{'<'}</Flex>
                {days}
                <Flex cursor={'default'} onClick={()=>{targetSetter([targetDate[0],targetDate[1]+1,1])}}>{'>'}</Flex>
            </Flex>
        </Flex>
        
    );
}
function Sort(arr = [],compareFn = (a,b)=>{return a>b}) {
    let map = new Array(arr.length).fill(0).map((v,i)=>{return i;});
    let n = arr.length;
    for (let i = 0; i < n-1; i++)
        for (let j = 0; j < n-i-1; j++)
            if (compareFn(arr[j],arr[j+1])) {
                let temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;

                const tempmap = map[j];
                map[j] = map[j+1];
                map[j+1] = tempmap;
            }
    return [arr,map];
}
function MainDatesList({targetDate = [new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate(), new Date().getHours(),new Date().getMinutes(),new Date().getSeconds()],targetTables = []}) {
    const [events,setEvents] = useState({
        logistics: [],
        production: [],
        technics: [],
        quality: []
    });
    const [logistYOffsets, setLogistYOffsets] = useState([]);
    const [prodYOffsets, setProdYOffsets] = useState([]);
    const [techYOffsets, setTechYOffsets] = useState([]);
    const [qualityYOffsets, setQualityYOffsets] = useState([]);

    useEffect(()=>{
        let sqlFormatedTargetDate = `${targetDate[0]}-${(targetDate[1]).toString().padStart(2,'0')}-${targetDate[2].toString().padStart(2,'0')}`;
        (async ()=>{
            const dateIntervalToDuration = (datea, dateb) => {
                if (datea > dateb) {
                    const old = datea;
                    datea = dateb;
                    dateb = old;
                }
                let target = new Date(...targetDate);

                target.setMonth(targetDate[1]);
                datea.setMonth(datea.getMonth()+1);
                dateb.setMonth(dateb.getMonth()+1);

                if (target.getMonth() == datea.getMonth()) {
                    if (datea.getDate() == dateb.getDate()) {
                        const timea = datea.getHours()*60 + datea.getMinutes();
                        const timeb = dateb.getHours()*60 + dateb.getMinutes();
                        
                        return {time:timea,duration:timeb-timea};
                    } else {
                        if (target.getDate() == datea.getDate()) {
                            const time = datea.getHours()*60 + datea.getMinutes();
                            return {time:time,duration: 1440-time};
                        } else if (target.getDate() == dateb.getDate()) {
                            const time = dateb.getHours()*60 + dateb.getMinutes();
                            return {time:0,duration:time};
                        }  else {
                            return {time:0,duration:60*24};
                        }
                    }
                }

                return {time:0,duration:0};
            }

            let events = {logistics:[],production:[],technics:[]};
            let ordersDates = [], logistics =[], technicsProfilactics=[], production = [], qualityProfilactics = [];
            ordersDates = await window.DB.getGeneralRaw(`select hour(date) as hour, minute(date) as minute from trades where (date) like '${sqlFormatedTargetDate}%'`);
            logistics = await window.DB.getGeneralRaw(`select id,shipment_date as date,unloading_date,price,weight,truck_number,storage_zone from logistics where '${sqlFormatedTargetDate}' between DATE(shipment_date) and DATE(unloading_date)`);
            technicsProfilactics = await window.DB.getGeneralRaw(`select date, profilactics_date as prof_date, profilactics_time as prof_time, profilactics_description from technics where (profilactics_date) like '${sqlFormatedTargetDate}%'`);
            production = await window.DB.getGeneralRaw(`select date,deadline_date from production where '${sqlFormatedTargetDate}' between DATE(date) and DATE(deadline_date)`);
            //     qualityProfilactics = await window.DB.getGeneralRaw(`select date, check_start_date,check_end_date, processing_state from quality where (profilactics_date) like '${sqlFormatedTargetDate}%'`);
            // ordersDates.map((date)=>{addEvent(new Event(date.hour*60 + date.minute,'point', 0, 'order added'));});
            logistics.map((data)=>{
                const eventTime = dateIntervalToDuration(data.date,data.unloading_date); 
                const description = () => {
                    return (
                        <Flex gap={3}>
                            <Flex direction={'column'}>
                                <Text>ID</Text>
                                <Text>Transport company</Text>

                                <Text>Truck number</Text>
                                <Text>Storage zone</Text>

                                <Text>Price</Text>
                                <Text>Weight</Text>
                                <Button variant={'outline'} size={'sm'}>Go to row</Button>
                            </Flex>
                            <Flex direction={'column'}>
                                <Text>{data.id}</Text>
                                <Text># ADD COMPANY #</Text>
                                
                                <Text>{data.truck_number}</Text>
                                <Text>{data.storage_zone}</Text>

                                <Text>{data.price}</Text>
                                <Text>{data.weight}</Text>
                            </Flex>
                        </Flex>
                    );
                };
                events.logistics.push(new Event(eventTime.time, 'duration', eventTime.duration, description,'logistics','green'));
            });
            production.map((date)=>{
                const eventTime = dateIntervalToDuration(date.date,date.deadline_date); 
                const description = () => {
                    return (<Flex gap={2}>
                        <Flex direction={'column'}>
                            <Text>Weight</Text>
                            <Text>Waste</Text>
                            <Button variant={'outline'} size={'sm'}>Go to row</Button>
                        </Flex>
                        <Flex direction={'column'}>
                            <Text>Weight</Text>
                            <Text>Waste</Text>
                        </Flex>
                    </Flex>);
                };
                events.production.push(new Event(eventTime.time, "duration",eventTime.duration,description,'production','blue'));
            });
            technicsProfilactics.map((date)=>{
                let profTime = date.prof_time.split(':').map((t)=>{return Number(t)});
                let profDate = new Date(date.prof_date);
                const description = () => {
                    return (<Text>{date.profilactics_description}</Text>);
                };
                events.technics.push(new Event(profDate.getHours()*60+profDate.getMinutes(),'duration',profTime[0]*60+profTime[1], description, 'technics'));
            });
            setEvents(events);
        })();
    },[targetDate,targetTables]);
    useEffect(()=>{
        const isOverlap = (a,b) => { //
            let a_timeUV = a.time / 1440;
            let a_durationUV = a.duration / 1440;
            let b_timeUV = b.time / 1440;
            let b_durationUV = b.duration / 1440;

            if (a_timeUV <= b_timeUV && a_timeUV+a_durationUV >= b_timeUV+b_durationUV) return true;
            if (a_timeUV >= b_timeUV && a_timeUV+a_durationUV <= b_timeUV+b_durationUV) return true;

            if (a_timeUV >= b_timeUV && a_timeUV <= b_timeUV+b_durationUV) return true;
            if (a_timeUV+a_durationUV >= b_timeUV && a_timeUV+a_durationUV <= b_timeUV+b_durationUV) return true;

            return false;
        }
        const yStep = 25;
        // TODO symmetric offseting by sorting with time+duration
        const CalcYOffsets = (elements) => {
            let sortedEvents = [...elements];
            let sortMap = [];
            let _sort = Sort(sortedEvents, (a,b)=>{return a.time>b.time});
            sortedEvents = _sort[0];
            sortMap = _sort[1];

            let duratedEvents = [];
            let offsets = [];
            for (let i = 0; i < sortedEvents.length; i++) {
                if (sortedEvents[i].type == 'duration' || true) {
                    duratedEvents.push({ind:i,event:sortedEvents[i]});
                    offsets.push(0);
                }
            }
            for (let i = 0; i < duratedEvents.length; i++) {
                let xTravel = 1;
                while (i+xTravel < duratedEvents.length) {
                    let state = isOverlap(duratedEvents[i].event,duratedEvents[i+xTravel].event);                
                    if (state) {
                        if (offsets[i] == offsets[i+xTravel]) {
                            offsets[i] += yStep;
                            xTravel = 1;
                            continue;
                        }
                    } else break;
                    xTravel++;
                }
                xTravel = 1;
                while (i-xTravel >= 0) {
                    let state = isOverlap(duratedEvents[i].event,duratedEvents[i-xTravel].event);
                    if (state) {
                        if (offsets[i] == offsets[i-xTravel]) {
                            offsets[i] += yStep;
                            xTravel = 1;
                            continue;
                        }
                    }
                    xTravel++;
                }
            }
            // console.log(offsets);
            let mappedOffsets = new Array(elements.length).fill(0);
            duratedEvents.map((v,i)=>{mappedOffsets[v.ind] = offsets[i]});

            let unsortedOffsets = new Array(elements.length).fill(0);
            sortMap.map((newind,i)=>{unsortedOffsets[newind] = mappedOffsets[i]});

            return unsortedOffsets;
        }
        
        setLogistYOffsets(CalcYOffsets(events.logistics));
        setProdYOffsets(CalcYOffsets(events.production));
        setTechYOffsets(CalcYOffsets(events.technics));
    },[events]);
    return (
    <Flex w={'100%'} position={'relative'}>
        <Flex w={'100%'} direction={'column'} gap={3}>
            <Flex hidden={!targetTables.includes('logistics')} minH={Math.max(...logistYOffsets)+"px"}>
                <Flex style={{writingMode:'vertical-rl'}}>Logistics</Flex>
                <EventsMarking events={events.logistics} yOffsets={logistYOffsets}/>
            </Flex>
            <Divider variant={'dashed'} borderColor={'black'}/>
            <Flex hidden={!targetTables.includes('production')} minH={Math.max(...prodYOffsets)+"px"}>
                <Flex style={{writingMode:'vertical-rl'}}>Production</Flex>
                <EventsMarking events={events.production} yOffsets={prodYOffsets}/>
            </Flex>
            <Divider variant={'dashed'} borderColor={'black'}/>
            <Flex hidden={!targetTables.includes('technics')} minH={Math.max(...techYOffsets)+"px"}>
                <Flex style={{writingMode:'vertical-rl'}}>Technics</Flex>
                <EventsMarking events={events.technics} yOffsets={techYOffsets}/>
            </Flex>
            <Divider variant={'dashed'} borderColor={'black'}/>
            <Flex hidden={!targetTables.includes('quality')} minH={Math.max(...qualityYOffsets)+"px"}>
                <Flex style={{writingMode:'vertical-rl'}}>Quality</Flex>
                <EventsMarking events={events.quality} yOffsets={qualityYOffsets}/>
            </Flex>
        </Flex>
        {(new Date().getFullYear() == targetDate[0] && new Date().getMonth()+1 == targetDate[1] && new Date().getDate() == targetDate[2]) ? 
            <Flex position={'absolute'} h={'100%'} w={'0.1px'} opacity={0.3} left={`${(new Date().getHours()*60+new Date().getMinutes())/1440*100}%`} top={'-12px'} bgColor={'black'}></Flex> : ''}
    </Flex>)
}
function DatesTab({}) {
    const [targetDate,setTargetDate] = useState([new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate(), new Date().getHours(),new Date().getMinutes(),new Date().getSeconds()]);
    const [targetTables,setTargetTables] = useState(['orders','logistics','technics','production','quality']);
    function toggleTargetTables(state,value) {
        if (state) setTargetTables(placeArrayUnq(targetTables,value));
        else setTargetTables(removeArrayUnq(targetTables,value));
    }
    
    return (
        <Flex direction={'row'}>
            <Flex direction={'column'} w={'100%'}>
                <TargetDatePicker targetDate={targetDate} targetSetter={setTargetDate} targetTables={targetTables}/>
                <Flex direction={'column'} w={"100%"} borderTop={'1px solid black'}>
                    <TimeDivider/>
                    <MainDatesList targetTables={targetTables} targetDate={targetDate}/>
                </Flex>
            </Flex>
            <Flex position={'absolute'} left={'16px'} bottom={'16px'}>
                <Popover>
                    <PopoverTrigger>
                        <InfoIcon/>
                    </PopoverTrigger>
                    <Portal>
                        <PopoverContent>
                            <PopoverBody>
                                <Flex direction={'column'} gap={2}>
                                    <Flex gap={1} alignItems={'center'}><Checkbox defaultChecked={true} onChange={(e)=>{toggleTargetTables(e.target.checked,'logistics');}} marginRight={1}/><FaTruck size={18}/><Text fontSize={'12px'}>Logistics</Text><Flex w={'100%'} h={'10px'} bgImage={greenStripes} bgRepeat={"repeat"} bgSize={'200px'}></Flex></Flex>
                                    <Flex gap={1} alignItems={'center'}><Checkbox defaultChecked={true} onChange={(e)=>{toggleTargetTables(e.target.checked,'production');}} marginRight={1}/><BsHammer size={18}/><Text fontSize={'12px'}>Production</Text><Flex w={'100%'} h={'10px'} bgImage={blueStripes} bgRepeat={"repeat"} bgSize={'200px'}></Flex></Flex>
                                    <Flex gap={1} alignItems={'center'}><Checkbox defaultChecked={true} onChange={(e)=>{toggleTargetTables(e.target.checked,'technics');}} marginRight={1}/><TiSpanner size={18}/><Text fontSize={'12px'}>Technics</Text><Flex w={'100%'} h={'10px'} bgImage={redStripes} bgRepeat={"repeat"} bgSize={'200px'}></Flex></Flex>
                                    <Flex gap={1} alignItems={'center'}><Checkbox defaultChecked={true} onChange={(e)=>{toggleTargetTables(e.target.checked,'quality');}} marginRight={1}/><BiNotepad size={18}/><Text fontSize={'12px'}>Quality</Text><Flex w={'100%'} h={'10px'} bgImage={redStripes} bgRepeat={"repeat"} bgSize={'200px'}></Flex></Flex>
                                </Flex>
                            </PopoverBody>
                        </PopoverContent>
                    </Portal>
                </Popover>
            </Flex>
        </Flex>
    );
}
export {DatesTab,MainDatesList,TimeDivider,TargetDatePicker};