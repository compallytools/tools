<?php

declare(strict_types=1);

namespace App\Demo\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Module de démonstration : host demo.host (config/modules.yaml), noms demo_*.
 */
final class DemoController extends AbstractController
{
    #[Route('/', name: 'index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('@Demo/index.html.twig');
    }
}
