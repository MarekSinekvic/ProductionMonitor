<?php

class Product {
    public int $id, $state;
    public string $date;
    public int | null $weight, $waste;
    function __construct($id,$state,$date,$weight,$waste) {
        $this->id = $id;
        $this->state = $state;
        $this->date = $date;
        $this->weight = $weight;
        $this->waste = $waste;
    }
}
class Scanner {
    static function send(int $user_id,string $barcode) {
        $conn = get_connection();
        $logist_id = intval(substr($barcode,0,4));
        $conn->query("insert into scanner_add_log (barcode,user_id,logistics_id) values ('$barcode',$user_id,$logist_id)");
    }
    static function get_productions() : array {
        $conn = get_connection();
        $prods = $conn->query("select * from production order by date desc limit 100");
        $prods = $prods->fetch_all(MYSQLI_ASSOC);
        $prods = array_map(fn($row): Product => new Product($row['id'],$row['processing_state'],$row['date'],$row['weight'],$row['waste']), $prods);
        return $prods;
    }
}