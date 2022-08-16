<?php
require_once "vendor/autoload.php";

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelHigh;
use Endroid\QrCode\Label\Alignment\LabelAlignmentCenter;
use Endroid\QrCode\Label\Font\OpenSans;
use Endroid\QrCode\RoundBlockSizeMode\RoundBlockSizeModeMargin;
use Endroid\QrCode\Writer\PngWriter;

if (isset($_GET['text'])) {
    $writer = new PngWriter();
    $result = Builder::create()
        ->writer(new PngWriter())
        ->writerOptions([])
        ->data($_GET['text'])
        ->encoding(new Encoding('UTF-8'))
        ->errorCorrectionLevel(new ErrorCorrectionLevelHigh())
        ->size(500)
        ->margin(5)
        ->roundBlockSizeMode(new RoundBlockSizeModeMargin())
        // ->logoPath('assets/qrlogo.png')
        ->labelText($_GET['text'])
        ->labelFont(new OpenSans(15))
        ->labelAlignment(new LabelAlignmentCenter())
        ->build();

    header('Content-Type: '.$result->getMimeType());
    echo $result->getString();
}
