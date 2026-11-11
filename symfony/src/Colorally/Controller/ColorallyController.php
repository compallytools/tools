<?php

declare(strict_types=1);

namespace App\Colorally\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Module Colorally : host colorally.host (config/modules.yaml), noms colorally_*.
 */
final class ColorallyController extends AbstractController
{
    #[Route('/', name: 'index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('@Colorally/index.html.twig');
    }
}
