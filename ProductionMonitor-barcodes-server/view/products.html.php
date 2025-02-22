<?php

    foreach ($products as $prod) {
        $bgColor = 'transparent';
        if ($prod->state == 0) $bgColor = 'transparent';
        else if ($prod->state == 1) $bgColor = 'rgb(130,255,130)';
        else if ($prod->state == 2) $bgColor = 'rgb(130,130,255)';
        echo "<tr style='text-align:center; background-color: {$bgColor}'>
                <td>$prod->id</td>
                <td>$prod->date</td>
                <td>$prod->weight</td>
                <td>$prod->waste</td>
            </tr>";
    }