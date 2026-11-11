<?php

declare(strict_types=1);

namespace App\ContrastGrid\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Pages du module : host CONTRAST_GRID_HOST, noms contrast_grid_* (config/routes.yaml).
 * L'API du module est gérée par API Platform (src/ContrastGrid/ApiResource).
 */
final class ContrastGridController extends AbstractController
{
    #[Route('/', name: 'index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('@ContrastGrid/index.html.twig');
    }
}
