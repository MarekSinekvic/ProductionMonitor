import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Avatar, Box, Button, Divider, Flex, Input, Stack, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from '@chakra-ui/react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react';
import { DataTable, DefaultTable, SQLFilterCondition,SQLOrderCondition, useModalStyler,useTableState } from "../DataTable";
import {DetailedDescription, DrawerFullData} from "../DetailedDescription";
import { attachFiles } from "../FileAttach";

function ProfileView() {
    const [avatarUrl,setAvatarUrl] = useState('');
    const [profileHover,setProfileHover] = useState(false);

    useEffect(()=>{
        (async ()=>{
            const avatarUrl = await window.DB.getGeneralRaw(`select files_links.file_path from users 
                                    join files_links on files_links.id=users.avatar_file_id
                                    where users.id=${window.sessionStorage.getItem('id')}`);
            if (avatarUrl.length > 0) setAvatarUrl(avatarUrl[0].file_path);
            
        })();
    },[]);
    return (
        <Flex direction="row" gap={2} border={'1px solid rgba(0,0,0,0.3)'} w={'fit-content'} p={2}>
            <label htmlFor="avatar_select">
            <Avatar src={"img:///"+avatarUrl} size={'xl'} transition={"0.1s"} filter={profileHover ? "brightness(0.8)" : "brightness(1)"} 
            onClick={()=>{}} onMouseEnter={()=>{setProfileHover(true)}} onMouseLeave={()=>{setProfileHover(false)}}></Avatar>
            </label>
            <input type="file" hidden id="avatar_select" accept="image/*" onChange={(e)=>{
                window.DB.getGeneralRaw(`replace into files_links (file_path) values ("${e.target.files[0].path.split('\\').join('\\\\')}")`).then(e=>{
                    window.DB.getGeneralRaw(`update users set avatar_file_id=${e.insertId} where id=${window.sessionStorage.getItem('id')}`);
                });
                setAvatarUrl(e.target.files[0].path);
            }}></input>
            <Flex gap={10}>
                <Flex direction="column">
                    <Flex>Name</Flex>
                    <Flex>Password</Flex>
                    <Flex>Task</Flex>
                </Flex>
                <Flex direction="column">
                    <Flex>{window.sessionStorage.getItem("name")}</Flex>
                    <Flex>{window.sessionStorage.getItem("password")}</Flex>
                    <Flex>{window.sessionStorage.getItem("taskName")}</Flex>
                </Flex>
            </Flex>
        </Flex>)
}

function SettingsTab() {

    const tradesCompsTable = useTableState({},'trades_companies');
    const logisticCompsTable = useTableState({},'logistic_companies');
    const logisticProcessTable = useTableState({},'logistic_processing_states');
    const usersTable = useTableState({},'users');

    useEffect(()=>{
        let fitlerCond = SQLFilterCondition(tradesCompsTable.colState.filters);
        let orderCond = SQLOrderCondition(tradesCompsTable.colState.sort);
        window.DB.getGeneralRaw(`select * from trades_companies
                                ${fitlerCond}
                                ${orderCond} `).then((v)=>{
            tradesCompsTable.setData(v);
            tradesCompsTable.setFullData(v);

        });
        window.DB.getGeneralRaw(`describe trades_companies`).then((v)=>{
            tradesCompsTable.setRows(v.map((field)=>{
                return field.Field;
            }));
        });

        fitlerCond = SQLFilterCondition(logisticCompsTable.colState.filters);
        orderCond = SQLOrderCondition(logisticCompsTable.colState.sort);
        window.DB.getGeneralRaw(`select * from logistic_companies
                                ${fitlerCond}
                                ${orderCond} `).then((v)=>{

            logisticCompsTable.setData(v);
            logisticCompsTable.setFullData(v);
        });
        window.DB.getGeneralRaw(`describe logistic_companies`).then((v)=>{
            logisticCompsTable.setRows(v.map((field)=>{
                return field.Field;
            }));
        });

        fitlerCond = SQLFilterCondition(logisticProcessTable.colState.filters);
        orderCond = SQLOrderCondition(logisticProcessTable.colState.sort);
        window.DB.getGeneralRaw(`select * from logistic_processing_states
                                ${fitlerCond}
                                ${orderCond} `).then((v)=>{

            logisticProcessTable.setData(v);
            logisticProcessTable.setFullData(v);
        });
        window.DB.getGeneralRaw(`describe logistic_processing_states`).then((v)=>{
            logisticProcessTable.setRows(v.map((field)=>{
                return field.Field;
            }));
        });

        fitlerCond = SQLFilterCondition(usersTable.colState.filters);
        orderCond = SQLOrderCondition(usersTable.colState.sort);
        window.DB.getGeneralRaw(`select * from users
                                ${fitlerCond}
                                ${orderCond} `).then((v)=>{

            usersTable.setData(v);
            usersTable.setFullData(v);
        });
        window.DB.getGeneralRaw(`describe users`).then((v)=>{
            usersTable.setRows(v.map((field)=>{
                return field.Field;
            }));
        });

    },[tradesCompsTable.colState,logisticCompsTable.colState,logisticProcessTable.colState, tradesCompsTable.AddDisclosure.isOpen,logisticCompsTable.AddDisclosure.isOpen,logisticProcessTable.AddDisclosure.isOpen,
    tradesCompsTable.DetailsDisclosure.isOpen,logisticCompsTable.DetailsDisclosure.isOpen,logisticProcessTable.DetailsDisclosure.isOpen,usersTable.DetailsDisclosure.isOpen,usersTable.AddDisclosure.isOpen]);

    return (
        <>
            <Accordion allowToggle>
                <AccordionItem>
                        <AccordionButton>
                            My profile
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <ProfileView/>
                        </AccordionPanel>
                    </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        Tables
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                        <Stack direction={'row'} h={'400px'} overflow={'auto'}>
                            <Box w={'50%'}>                                
                                <DefaultTable sqlTarget="materials"/>
                            </Box>
                            <Divider orientation="vertical" height={'100%'}></Divider>
                            <Box w={'50%'}>
                                <DefaultTable sqlTarget="user_tasks"/>
                                <DefaultTable sqlTarget="users"/>
                            </Box>
                        </Stack>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionButton>
                        External companies tables
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                        <Stack direction={'row'} h={'400px'}>
                            <Box overflowY={'auto'} width={'50%'}>
                                <DefaultTable sqlTarget="trades_companies"/>
                            </Box>
                            <Divider orientation="vertical" height={'100%'}></Divider>
                            <Box overflowY={'auto'} width={'50%'}>
                                <DefaultTable sqlTarget="logistic_companies"/>
                            </Box>
                        </Stack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
            <Button variant={'outline'} position={'fixed'} right={'30px'} bottom={'30px'} onClick={()=>{window.location.hash = "#"}}>Exit account</Button>
        </>
    );
}
export default SettingsTab;