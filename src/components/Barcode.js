import { LinkIcon, ViewIcon } from "@chakra-ui/icons";
import { Button, Flex, IconButton } from "@chakra-ui/react";
import React, { useRef } from "react";      
import { ReactBarcode } from "react-jsbarcode";


function Barcode({data}) {
    const barcodeRef = useRef(null);
    return <>
        <Flex direction={'column'} border={'1px solid rgba(0,0,0,0.2)'} paddingBottom={2}>
            <Button p={0} w={'fit-content'} h={'fit-content'} variant={'ghost'} onClick={()=>{
                window.Files.saveBarcode(barcodeRef.current.children[0].outerHTML);
            }}>
                <div ref={barcodeRef}><ReactBarcode value={data} options={{width:1,height:40,fontSize:'10px'}} renderer='svg' className='barcode'></ReactBarcode></div>
            </Button>
            <Flex justifyContent={'space-evenly'}>
                <IconButton icon={<LinkIcon/>}></IconButton>
                <IconButton icon={<ViewIcon/>}></IconButton>
            </Flex>
        </Flex>
    </>;
}

export {Barcode};